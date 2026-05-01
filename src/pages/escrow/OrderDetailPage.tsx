import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, escrowApi, paymentApi } from '@/lib/escrow-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, Truck, CheckCircle, CreditCard, AlertTriangle, ArrowLeft, Package, Clock, DollarSign, FileText,
} from 'lucide-react';
import type { Order, OrderStatus, PaymentMethod } from '@/types/escrow';

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'awaiting_payment', label: 'Payment', icon: CreditCard },
  { status: 'in_escrow', label: 'In Escrow', icon: Shield },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Package },
  { status: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('visa');
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getById(orderId!),
    enabled: !!orderId,
  });

  const order = data?.data;

  const payMutation = useMutation({
    mutationFn: () => paymentApi.create({ orderId: orderId!, method: paymentMethod, currency: order?.currency || 'USD' }),
    onSuccess: (res) => {
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast({ title: t('escrow.paymentSuccess', 'Payment submitted successfully') });
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      }
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => escrowApi.confirmDelivery({ orderId: orderId! }),
    onSuccess: () => {
      toast({ title: t('escrow.deliveryConfirmed', 'Delivery confirmed! Funds released to seller.') });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  const disputeMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('orderId', orderId!);
      formData.append('reason', disputeReason);
      formData.append('description', disputeDescription);
      return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/dispute/open`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      }).then(r => r.json());
    },
    onSuccess: () => {
      toast({ title: t('escrow.disputeOpened', 'Dispute opened successfully') });
      setDisputeOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">{t('escrow.orderNotFound', 'Order not found')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/orders')} className="text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('escrow.backToOrders', 'Back to Orders')}
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('escrow.order', 'Order')} #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            {t('escrow.placed', 'Placed')} {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-1">
          {order.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Progress Steps */}
      {order.status !== 'disputed' && order.status !== 'refunded' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {i > 0 && (
                        <div className={`h-0.5 flex-1 ${i <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                      <div className={`p-2 rounded-full border-2 ${
                        isCurrent ? 'border-primary bg-primary text-primary-foreground' :
                        isComplete ? 'border-primary bg-primary/10 text-primary' :
                        'border-muted bg-muted text-muted-foreground'
                      }`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('escrow.orderItems', 'Order Items')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.name.en}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('escrow.qty', 'Qty')}: {item.quantity} × {order.currency} {item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">{order.currency} {item.totalPrice.toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <p className="text-lg font-bold text-foreground">{t('escrow.total', 'Total')}</p>
                  <p className="text-lg font-bold text-primary">{order.currency} {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          {order.shippingDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-accent" />
                  {t('escrow.shippingDetails', 'Shipping Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('escrow.carrier', 'Carrier')}</span>
                  <span className="font-medium text-foreground">{order.shippingDetails.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('escrow.tracking', 'Tracking Number')}</span>
                  <span className="font-medium text-foreground">{order.shippingDetails.trackingNumber}</span>
                </div>
                {order.shippingDetails.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('escrow.estimated', 'Estimated Delivery')}</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.shippingDetails.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          {/* Pay Now */}
          {order.status === 'awaiting_payment' && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {t('escrow.makePayment', 'Make Payment')}
                </CardTitle>
                <CardDescription>{t('escrow.paymentSecure', 'Payment is held securely in escrow')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('escrow.paymentMethod', 'Payment Method')}</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">MasterCard</SelectItem>
                      <SelectItem value="bank_transfer">{t('escrow.bankTransfer', 'Bank Transfer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('escrow.amount', 'Amount')}</span>
                    <span className="font-bold text-foreground">{order.currency} {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>
                  <Shield className="mr-2 h-4 w-4" />
                  {payMutation.isPending ? t('common.loading') : t('escrow.payNow', 'Pay Now (Escrow Protected)')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Confirm Delivery */}
          {(order.status === 'shipped' || order.status === 'delivered') && (
            <Card className="border-success">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  {t('escrow.confirmDelivery', 'Confirm Delivery')}
                </CardTitle>
                <CardDescription>
                  {t('escrow.confirmDeliveryDesc', 'Confirm that you have received the goods. This will release funds to the seller.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.autoReleaseDate && (
                  <div className="p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                    <Clock className="h-4 w-4 text-warning mt-0.5" />
                    <p className="text-sm text-warning">
                      {t('escrow.autoRelease', 'Auto-release on')} {new Date(order.autoReleaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {confirmMutation.isPending ? t('common.loading') : t('escrow.confirmReceived', 'Confirm Received')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Escrow Info */}
          {order.status === 'in_escrow' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('escrow.fundsSecure', 'Funds Secured')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('escrow.fundsSecureDesc', 'Your payment is held safely in escrow. The seller has been notified to process your order.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Open Dispute */}
          {['in_escrow', 'shipped', 'delivered'].includes(order.status) && (
            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {t('escrow.openDispute', 'Open Dispute')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('escrow.openDispute', 'Open Dispute')}</DialogTitle>
                  <DialogDescription>
                    {t('escrow.disputeDesc', 'Describe the issue with your order. The escrow funds will be frozen during review.')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('escrow.disputeReason', 'Reason')}</Label>
                    <Select value={disputeReason} onValueChange={setDisputeReason}>
                      <SelectTrigger><SelectValue placeholder={t('escrow.selectReason', 'Select a reason')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_as_described">{t('escrow.notAsDescribed', 'Not as described')}</SelectItem>
                        <SelectItem value="defective">{t('escrow.defective', 'Defective product')}</SelectItem>
                        <SelectItem value="not_received">{t('escrow.notReceived', 'Not received')}</SelectItem>
                        <SelectItem value="wrong_item">{t('escrow.wrongItem', 'Wrong item')}</SelectItem>
                        <SelectItem value="other">{t('escrow.other', 'Other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('escrow.description', 'Description')}</Label>
                    <Textarea
                      value={disputeDescription}
                      onChange={(e) => setDisputeDescription(e.target.value)}
                      placeholder={t('escrow.disputePlaceholder', 'Describe the issue in detail...')}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDisputeOpen(false)}>{t('common.cancel')}</Button>
                  <Button variant="destructive" onClick={() => disputeMutation.mutate()} disabled={disputeMutation.isPending || !disputeReason || !disputeDescription}>
                    {disputeMutation.isPending ? t('common.loading') : t('escrow.submitDispute', 'Submit Dispute')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
