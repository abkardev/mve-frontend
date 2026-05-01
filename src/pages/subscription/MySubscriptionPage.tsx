import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionApi } from '@/lib/subscription-api';
import { useToast } from '@/hooks/use-toast';
import { CalendarClock, CreditCard, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { PLANS, PLAN_ORDER } from '@/lib/plans';

export default function MySubscriptionPage() {
  const { subscription, plan, isLoading, isVendor, refetch } = useSubscription();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => {
      toast({ title: 'Auto-renew turned off. Your plan stays active until the end date.' });
      refetch();
    },
    onError: () => toast({ title: 'Could not cancel', variant: 'destructive' }),
    onSettled: () => setCancelling(false),
  });

  if (!isVendor) {
    return (
      <div className="container py-12">
        <Alert>
          <AlertTitle>Vendor only</AlertTitle>
          <AlertDescription>Subscriptions are for vendor accounts. <Link className="text-primary underline" to="/pricing">View pricing</Link></AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container py-8"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!subscription || !plan) {
    return (
      <div className="container py-12 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold">No active subscription</h1>
        <p className="text-muted-foreground">Pick a plan to start selling and unlock vendor tools.</p>
        <Link to="/pricing"><Button size="lg">View plans</Button></Link>
      </div>
    );
  }

  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const expiringSoon = daysLeft <= 14 && daysLeft > 0;
  const expired = subscription.status === 'expired' || daysLeft <= 0;
  const upgradeOptions = PLAN_ORDER.filter((id) => id !== subscription.planType);

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My subscription</h1>
        <p className="text-muted-foreground">Manage your vendor plan and billing</p>
      </div>

      {expired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Subscription expired</AlertTitle>
          <AlertDescription>Your vendor features are restricted until you renew.</AlertDescription>
        </Alert>
      )}
      {expiringSoon && !expired && (
        <Alert>
          <CalendarClock className="h-4 w-4" />
          <AlertTitle>Expiring in {daysLeft} days</AlertTitle>
          <AlertDescription>Renew to avoid losing your visibility and listings.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{plan.name} plan</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">${plan.price}/year · {subscription.commissionRate}% commission</p>
          </div>
          <Badge variant={expired ? 'destructive' : 'default'}>{subscription.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-muted-foreground">Started</p><p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p></div>
            <div><p className="text-muted-foreground">Renews</p><p className="font-medium">{endDate.toLocaleDateString()}</p></div>
            <div><p className="text-muted-foreground">Auto-renew</p><p className="font-medium">{subscription.autoRenew ? 'On' : 'Off'}</p></div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/pricing"><Button variant="outline"><CreditCard className="mr-2 h-4 w-4" /> Change plan</Button></Link>
            {subscription.autoRenew && (
              <Button variant="outline" onClick={() => { setCancelling(true); cancelMutation.mutate(); }} disabled={cancelling}>
                {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel auto-renew
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Save more by upgrading</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {upgradeOptions.map((id) => {
            const target = PLANS[id];
            const diff = subscription.commissionRate - target.commissionRate;
            return (
              <Link key={id} to="/pricing" className="block">
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{target.name}</p>
                      <p className="text-xs text-muted-foreground">${target.price}/yr · {target.commissionLabel} commission</p>
                      {diff > 0 && <p className="text-xs text-success mt-1">Save {diff}% per transaction</p>}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
