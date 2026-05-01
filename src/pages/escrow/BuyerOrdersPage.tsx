import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi } from '@/lib/escrow-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Shield, Truck, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import type { Order, OrderStatus } from '@/types/escrow';

const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-muted text-muted-foreground', label: 'Pending' },
  awaiting_payment: { icon: DollarSign, color: 'bg-warning/10 text-warning', label: 'Awaiting Payment' },
  in_escrow: { icon: Shield, color: 'bg-primary/10 text-primary', label: 'In Escrow' },
  shipped: { icon: Truck, color: 'bg-accent/10 text-accent', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-success/10 text-success', label: 'Delivered' },
  completed: { icon: CheckCircle, color: 'bg-success/10 text-success', label: 'Completed' },
  disputed: { icon: AlertTriangle, color: 'bg-destructive/10 text-destructive', label: 'Disputed' },
  refunded: { icon: DollarSign, color: 'bg-muted text-muted-foreground', label: 'Refunded' },
};

export default function BuyerOrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => orderApi.getMyOrders('buyer'),
    enabled: !!user,
  });

  const orders = data?.data || [];

  const filterOrders = (statuses: OrderStatus[]) =>
    orders.filter((o) => statuses.includes(o.status));

  const activeOrders = filterOrders(['awaiting_payment', 'in_escrow', 'shipped']);
  const completedOrders = filterOrders(['delivered', 'completed']);
  const disputedOrders = filterOrders(['disputed', 'refunded']);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('escrow.myOrders', 'My Orders')}</h1>
          <p className="text-muted-foreground">{t('escrow.trackOrders', 'Track your orders and manage payments')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeOrders.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.activeOrders', 'Active Orders')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.completed', 'Completed')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{disputedOrders.length}</p>
              <p className="text-sm text-muted-foreground">{t('escrow.disputes', 'Disputes')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">{t('escrow.active', 'Active')} ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">{t('escrow.completed', 'Completed')} ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="disputed">{t('escrow.disputed', 'Disputed')} ({disputedOrders.length})</TabsTrigger>
          <TabsTrigger value="all">{t('common.all', 'All')} ({orders.length})</TabsTrigger>
        </TabsList>

        {['active', 'completed', 'disputed', 'all'].map((tab) => {
          const tabOrders = tab === 'active' ? activeOrders
            : tab === 'completed' ? completedOrders
            : tab === 'disputed' ? disputedOrders
            : orders;

          return (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))
              ) : tabOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {t('escrow.noOrders', 'No orders found')}
                  </CardContent>
                </Card>
              ) : (
                tabOrders.map((order) => (
                  <OrderCard key={order._id} order={order} onView={() => navigate(`/orders/${order._id}`)} />
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function OrderCard({ order, onView }: { order: Order; onView: () => void }) {
  const { t } = useTranslation();
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">#{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} {t('escrow.items', 'items')} · {order.currency} {order.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={config.color}>
              {config.label}
            </Badge>
            <Button variant="outline" size="sm" onClick={onView}>
              {t('common.view', 'View')}
            </Button>
          </div>
        </div>

        {/* Escrow progress */}
        <div className="mt-4 flex items-center gap-1">
          {(['awaiting_payment', 'in_escrow', 'shipped', 'delivered', 'completed'] as OrderStatus[]).map((step, i) => {
            const stepIndex = ['awaiting_payment', 'in_escrow', 'shipped', 'delivered', 'completed'].indexOf(order.status);
            const isComplete = i <= stepIndex;
            return (
              <div key={step} className="flex-1 flex items-center">
                <div className={`h-1.5 w-full rounded-full ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
