import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, X, Sparkles, Loader2, Landmark, CreditCard } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionApi } from '@/lib/subscription-api';
import type { Plan, PlanType } from '@/types/subscription';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  currentPlan?: PlanType | null;
  highlight?: boolean;
}

const readable = (value: string) => value.replace(/_/g, ' ');

export function PlanCard({ plan, currentPlan, highlight }: PlanCardProps) {
  const { t } = useTranslation();
  const tt = t as (key: string, options?: Record<string, unknown> | string) => string;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isCurrent = currentPlan === plan.id;
  const featured = highlight ?? !!plan.badge;
  const featureRows: { label: string; value: string | boolean }[] = [
    { label: tt('pricing.planFeatures.products', { count: plan.features.maxProducts === -1 ? tt('pricing.unlimited') : plan.features.maxProducts }), value: true },
    { label: tt('pricing.planFeatures.commission', { commission: plan.commissionLabel }), value: true },
    { label: tt(`pricing.features.storefront.${plan.features.storefront}`, readable(plan.features.storefront)), value: true },
    { label: tt(`pricing.features.marketAccess.${plan.features.marketAccess}`, readable(plan.features.marketAccess)), value: true },
    { label: tt(`pricing.features.searchRanking.${plan.features.searchRanking}`, readable(plan.features.searchRanking)), value: true },
    { label: tt('pricing.planFeatures.featuredPlacement'), value: plan.features.featuredPlacement !== 'none' },
    { label: tt('pricing.planFeatures.verifiedBadge'), value: plan.features.verifiedBadge === 'included' },
    { label: tt('pricing.planFeatures.buyerMessaging'), value: plan.features.fileSharing },
    { label: tt('pricing.planFeatures.bulkOrderTools'), value: plan.features.bulkOrderTools !== 'none' },
    { label: tt('pricing.planFeatures.promotions'), value: plan.features.promotions !== 'none' },
    { label: tt(`pricing.features.analytics.${plan.features.analytics}`, readable(plan.features.analytics)), value: true },
    { label: tt('pricing.planFeatures.apiAccess'), value: plan.features.apiAccess },
    { label: tt('pricing.planFeatures.multiUser'), value: plan.features.multiUserAccounts },
    { label: tt('pricing.planFeatures.adsTools'), value: plan.features.adsTools !== 'none' },
    { label: tt(`pricing.features.support.${plan.features.support}`, readable(plan.features.support)), value: true },
  ];

  const handleSubscribe = async (paymentMethod: 'visa' | 'mastercard' | 'bank_transfer') => {
    if (!isAuthenticated) { navigate('/register'); return; }
    if (user?.role !== 'vendor') {
      toast({
        title: 'Vendor account required',
        description: 'Subscription plans are for vendors. Please register as a vendor.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await subscriptionApi.createCheckout({ planType: plan.id, paymentMethod });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else if (res.data?.paymentMethod === 'bank_transfer') {
        toast({
          title: 'Bank transfer request created',
          description: `Use reference ${res.data.instructions?.reference || res.data.sessionId} when sending the transfer.`,
        });
      } else {
        toast({ title: 'Could not start checkout', variant: 'destructive' });
      }
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Checkout failed';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      'relative flex flex-col h-full transition-all',
      featured && 'border-primary shadow-lg shadow-primary/20 md:scale-105',
      isCurrent && 'ring-2 ring-success',
    )}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Sparkles className="h-3 w-3" /> {plan.badge ? t(`pricing.badges.${plan.badge}`, plan.badge) : null}
          </Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <h3 className="text-2xl font-bold text-foreground">{t(`pricing.plans.${plan.id}`, plan.name)}</h3>
        <div className="mt-2">
          <span className="text-4xl font-extrabold text-foreground">${plan.price.toLocaleString()}</span>
          <span className="text-muted-foreground">/{t('pricing.year')}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('pricing.commissionBilled', { commission: plan.commissionLabel })}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2.5 mt-4">
          {featureRows.map((row, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {row.value ? (
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={row.value ? 'text-foreground' : 'text-muted-foreground line-through'}>
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button className="w-full" variant="outline" disabled>{t('pricing.currentPlan')}</Button>
        ) : (
          <Button
            className="w-full"
            variant={featured ? 'default' : 'outline'}
            onClick={() => handleSubscribe('visa')}
            disabled={loading}
          >
            <CreditCard className="h-4 w-4" />
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
              currentPlan ? (plan.id === 'pro' || plan.id === 'growth' ? t('pricing.upgradeCard') : t('pricing.switchCard')) : t('pricing.subscribeCard')}
          </Button>
        )}
      </CardFooter>
      {!isCurrent && (
        <div className="px-6 pb-6 -mt-3">
          <Button variant="ghost" className="w-full gap-2" disabled={loading} onClick={() => handleSubscribe('bank_transfer')}>
            <Landmark className="h-4 w-4" /> {t('pricing.bankTransfer')}
          </Button>
        </div>
      )}
    </Card>
  );
}
