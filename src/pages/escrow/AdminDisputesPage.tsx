import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeApi, escrowApi } from '@/lib/escrow-api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle, CheckCircle, Shield, Eye, DollarSign, Ban, Clock, FileText, Image,
} from 'lucide-react';
import type { Dispute, DisputeStatus } from '@/types/escrow';
import type { User, Vendor } from '@/types';

const statusBadge: Record<DisputeStatus, { color: string; label: string }> = {
  open: { color: 'bg-warning/10 text-warning border-warning/30', label: 'Open' },
  under_review: { color: 'bg-primary/10 text-primary border-primary/30', label: 'Under Review' },
  resolved_refund: { color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Refunded' },
  resolved_release: { color: 'bg-success/10 text-success border-success/30', label: 'Released' },
  closed: { color: 'bg-muted text-muted-foreground border-border', label: 'Closed' },
};

export default function AdminDisputesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [decision, setDecision] = useState<'refund' | 'release'>('refund');
  const [resolveAmount, setResolveAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => disputeApi.getAll(),
  });

  const resolveMutation = useMutation({
    mutationFn: () => disputeApi.resolve({
      disputeId: selectedDispute!._id,
      decision,
      amount: parseFloat(resolveAmount),
      notes: adminNotes,
    }),
    onSuccess: () => {
      toast({ title: t('escrow.disputeResolved', 'Dispute resolved successfully') });
      setSelectedDispute(null);
      setResolveAmount('');
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  const disputes = data?.data || [];
  const openDisputes = disputes.filter(d => ['open', 'under_review'].includes(d.status));
  const resolvedDisputes = disputes.filter(d => ['resolved_refund', 'resolved_release', 'closed'].includes(d.status));

  const getBuyerName = (buyer: string | User) => typeof buyer === 'string' ? buyer : buyer.name;
  const getVendorName = (vendor: string | Vendor) => typeof vendor === 'string' ? vendor : vendor.storeName?.en || 'Vendor';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('escrow.disputeManagement', 'Dispute Management')}</h1>
        <p className="text-muted-foreground">{t('escrow.disputeManagementDesc', 'Review and resolve buyer-seller disputes')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{disputes.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.totalDisputes', 'Total Disputes')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openDisputes.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.openDisputes', 'Open')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedDisputes.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.resolved', 'Resolved')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {disputes.reduce((sum, d) => {
                  if (typeof d.order === 'object' && d.order) return sum + (d.order as any).totalAmount;
                  return sum;
                }, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{t('escrow.fundsInDispute', 'Funds in Dispute')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">{t('escrow.openDisputes', 'Open')} ({openDisputes.length})</TabsTrigger>
          <TabsTrigger value="resolved">{t('escrow.resolved', 'Resolved')} ({resolvedDisputes.length})</TabsTrigger>
          <TabsTrigger value="all">{t('common.all', 'All')} ({disputes.length})</TabsTrigger>
        </TabsList>

        {[
          { key: 'open', list: openDisputes },
          { key: 'resolved', list: resolvedDisputes },
          { key: 'all', list: disputes },
        ].map(({ key, list }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            ) : list.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">{t('escrow.noDisputes', 'No disputes')}</CardContent></Card>
            ) : (
              list.map((dispute) => {
                const badge = statusBadge[dispute.status];
                return (
                  <Card key={dispute._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <p className="font-semibold text-foreground">{dispute.reason}</p>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{dispute.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>{t('escrow.buyer', 'Buyer')}: {getBuyerName(dispute.buyer)}</span>
                            <span>{t('escrow.vendor', 'Vendor')}: {getVendorName(dispute.vendor)}</span>
                            <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                          </div>
                          {dispute.evidence.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Image className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {dispute.evidence.length} {t('escrow.evidence', 'evidence files')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={badge.color}>{badge.label}</Badge>
                          {['open', 'under_review'].includes(dispute.status) && (
                            <Button size="sm" onClick={() => setSelectedDispute(dispute)}>
                              <Eye className="mr-2 h-4 w-4" /> {t('escrow.review', 'Review')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Resolve Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('escrow.resolveDispute', 'Resolve Dispute')}</DialogTitle>
            <DialogDescription>{selectedDispute?.reason}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-foreground">{selectedDispute?.description}</p>
            </div>

            {selectedDispute?.evidence && selectedDispute.evidence.length > 0 && (
              <div>
                <Label className="mb-2 block">{t('escrow.evidence', 'Evidence')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDispute.evidence.map((e, i) => (
                    <div key={i} className="p-2 border rounded-lg text-center">
                      {e.type === 'image' ? (
                        <img src={e.url} alt="" className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="flex items-center gap-1 justify-center">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{e.type}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>{t('escrow.decision', 'Decision')}</Label>
              <Select value={decision} onValueChange={(v) => setDecision(v as 'refund' | 'release')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">
                    <div className="flex items-center gap-2"><Ban className="h-4 w-4 text-destructive" /> {t('escrow.refundBuyer', 'Refund to Buyer')}</div>
                  </SelectItem>
                  <SelectItem value="release">
                    <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-success" /> {t('escrow.releaseToSeller', 'Release to Seller')}</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('escrow.amount', 'Amount')}</Label>
              <Input type="number" value={resolveAmount} onChange={(e) => setResolveAmount(e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <Label>{t('escrow.adminNotes', 'Admin Notes')}</Label>
              <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder={t('escrow.adminNotesPlaceholder', 'Add resolution notes...')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>{t('common.cancel')}</Button>
            <Button
              variant={decision === 'refund' ? 'destructive' : 'default'}
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending || !resolveAmount || !adminNotes}
            >
              {resolveMutation.isPending ? t('common.loading') :
                decision === 'refund' ? t('escrow.confirmRefund', 'Confirm Refund') : t('escrow.confirmRelease', 'Confirm Release')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
