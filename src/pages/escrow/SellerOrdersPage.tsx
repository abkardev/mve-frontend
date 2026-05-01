import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi, escrowApi } from '@/lib/escrow-api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Package, Truck, CheckCircle, Shield, Clock, DollarSign } from 'lucide-react';
import type { Order, OrderStatus } from '@/types/escrow';

export default function SellerOrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => orderApi.getMyOrders('vendor'),
    enabled: !!user,
  });

  const shipMutation = useMutation({
    mutationFn: () => escrowApi.updateShipping({
      orderId: shippingOrder!._id,
      carrier,
      trackingNumber,
      estimatedDelivery: estimatedDelivery || undefined,
    }),
    onSuccess: () => {
      toast({ title: t('escrow.shippingUpdated', 'Shipping details updated') });
      setShippingOrder(null);
      setCarrier('');
      setTrackingNumber('');
      setEstimatedDelivery('');
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  const orders = data?.data || [];
  const pendingShipment = orders.filter(o => o.status === 'in_escrow');
  const shipped = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
  const completed = orders.filter(o => o.status === 'completed');

  const statusIcon: Record<string, React.ElementType> = {
    in_escrow: Shield,
    shipped: Truck,
    delivered: CheckCircle,
    completed: CheckCircle,
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('escrow.sellerOrders', 'Orders')}</h1>
        <p className="text-muted-foreground">{t('escrow.sellerOrdersDesc', 'Manage orders and update shipping')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingShipment.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.awaitingShipment', 'Awaiting Shipment')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><Truck className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{shipped.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.inTransit', 'In Transit')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completed.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.completed', 'Completed')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t('escrow.awaitingShipment', 'Awaiting Shipment')} ({pendingShipment.length})</TabsTrigger>
          <TabsTrigger value="shipped">{t('escrow.shipped', 'Shipped')} ({shipped.length})</TabsTrigger>
          <TabsTrigger value="completed">{t('escrow.completed', 'Completed')} ({completed.length})</TabsTrigger>
        </TabsList>

        {[
          { key: 'pending', list: pendingShipment },
          { key: 'shipped', list: shipped },
          { key: 'completed', list: completed },
        ].map(({ key, list }) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : list.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">{t('escrow.noOrders', 'No orders found')}</CardContent></Card>
            ) : (
              list.map((order) => {
                const Icon = statusIcon[order.status] || Package;
                return (
                  <Card key={order._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">#{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} {t('escrow.items', 'items')} · {order.currency} {order.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{order.status.replace('_', ' ')}</Badge>
                          {order.status === 'in_escrow' && (
                            <Button size="sm" onClick={() => setShippingOrder(order)}>
                              <Truck className="mr-2 h-4 w-4" /> {t('escrow.addShipping', 'Add Shipping')}
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

      {/* Shipping Dialog */}
      <Dialog open={!!shippingOrder} onOpenChange={(open) => !open && setShippingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('escrow.updateShipping', 'Update Shipping Details')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('escrow.carrier', 'Carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="DHL, FedEx, Aramex..." />
            </div>
            <div>
              <Label>{t('escrow.tracking', 'Tracking Number')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </div>
            <div>
              <Label>{t('escrow.estimated', 'Estimated Delivery')}</Label>
              <Input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingOrder(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => shipMutation.mutate()} disabled={shipMutation.isPending || !carrier || !trackingNumber}>
              {shipMutation.isPending ? t('common.loading') : t('escrow.confirmShipping', 'Confirm Shipping')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
