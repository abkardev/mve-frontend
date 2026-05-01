import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { subscriptionApi } from '@/lib/subscription-api';
import { PLAN_ORDER, PLANS } from '@/lib/plans';
import { Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { PlanType, Subscription } from '@/types/subscription';
import type { User } from '@/types';

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignVendor, setAssignVendor] = useState('');
  const [assignPlan, setAssignPlan] = useState<PlanType>('starter');
  const [override, setOverride] = useState('');

  const list = useQuery({ queryKey: ['admin-subs'], queryFn: () => subscriptionApi.adminList() });
  const analytics = useQuery({ queryKey: ['admin-subs-analytics'], queryFn: () => subscriptionApi.adminAnalytics() });

  const assignMutation = useMutation({
    mutationFn: () => subscriptionApi.adminAssign(assignVendor, assignPlan, override ? Number(override) : undefined),
    onSuccess: () => {
      toast({ title: 'Plan assigned' });
      setAssignVendor(''); setOverride('');
      queryClient.invalidateQueries({ queryKey: ['admin-subs'] });
    },
    onError: () => toast({ title: 'Failed to assign', variant: 'destructive' }),
  });

  const subs = list.data?.data || [];
  const stats = analytics.data?.data;

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Subscription management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Subscribers" value={stats?.totalSubscribers ?? '—'} />
        <StatCard icon={DollarSign} label="Monthly revenue" value={stats ? `$${stats.monthlyRevenue.toLocaleString()}` : '—'} />
        <StatCard icon={TrendingUp} label="Upgrades (30d)" value={stats?.upgrades ?? '—'} />
        <StatCard icon={TrendingDown} label="Churn rate" value={stats ? `${stats.churnRate.toFixed(1)}%` : '—'} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All subscriptions</CardTitle>
          <Dialog>
            <DialogTrigger asChild><Button>Assign / override plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign plan to vendor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Vendor user ID</Label><Input value={assignVendor} onChange={(e) => setAssignVendor(e.target.value)} /></div>
                <div>
                  <Label>Plan</Label>
                  <Select value={assignPlan} onValueChange={(v) => setAssignPlan(v as PlanType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLAN_ORDER.map((id) => <SelectItem key={id} value={id}>{PLANS[id].name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Commission override % (optional)</Label>
                  <Input type="number" step="0.1" value={override} onChange={(e) => setOverride(e.target.value)} placeholder="e.g. 4.5" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => assignMutation.mutate()} disabled={!assignVendor || assignMutation.isPending}>
                  {assignMutation.isPending ? 'Assigning…' : 'Assign'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {list.isLoading ? <Skeleton className="h-40" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-start text-muted-foreground border-b">
                  <th className="text-start p-2">Vendor</th>
                  <th className="text-start p-2">Plan</th>
                  <th className="text-start p-2">Commission</th>
                  <th className="text-start p-2">Status</th>
                  <th className="text-start p-2">Renews</th>
                </tr></thead>
                <tbody>
                  {subs.map((s: Subscription) => {
                    const u = s.userId as User;
                    return (
                      <tr key={s._id} className="border-b border-border">
                        <td className="p-2">{typeof u === 'object' ? u.name : String(u)}</td>
                        <td className="p-2">{PLANS[s.planType].name}</td>
                        <td className="p-2">{s.commissionRate}%</td>
                        <td className="p-2"><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                        <td className="p-2">{new Date(s.endDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {subs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No subscriptions yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card><CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
    </CardContent></Card>
  );
}
