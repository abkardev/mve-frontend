import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionApi } from '@/lib/subscription-api';
import { PLANS, getPlan } from '@/lib/plans';
import type { PlanType, PlanFeatures, Subscription } from '@/types/subscription';

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const isVendor = user?.role === 'vendor';

  const query = useQuery({
    queryKey: ['my-subscription', user?._id],
    queryFn: () => subscriptionApi.getMine(),
    enabled: isAuthenticated && isVendor,
    retry: 1,
    staleTime: 60_000,
  });

  const subscription: Subscription | null = (query.data?.data as Subscription | null) || null;
  const planType: PlanType | null = subscription?.planType ?? null;
  const isActive = subscription?.status === 'active';
  const features: PlanFeatures | null =
    subscription?.features || (planType ? getPlan(planType).features : null);

  function can(check: (f: PlanFeatures) => boolean): boolean {
    if (!isVendor) return true;
    if (!isActive || !features) return false;
    return check(features);
  }
  function gate(check: (f: PlanFeatures) => boolean, reason: string): string | null {
    return can(check) ? null : reason;
  }

  return {
    subscription, planType, isActive, isVendor, features,
    plan: planType ? PLANS[planType] : null,
    can, gate,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
