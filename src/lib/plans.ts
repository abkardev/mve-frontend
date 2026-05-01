import type { Plan, PlanType } from '@/types/subscription';

/**
 * Single source of truth for plan definitions.
 * Mirror these values on the backend in `backend/config/plans.js`.
 */
export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter', name: 'Starter', price: 1000, commissionRate: 10, commissionLabel: '10%',
    features: {
      maxProducts: 25, storefront: 'basic_logo_only', marketAccess: 'domestic_international', searchRanking: 'low',
      featuredPlacement: 'none', verifiedBadge: 'none', buyerMessaging: 'limited',
      fileSharing: false, dailyConversationLimit: 10, bulkOrderTools: 'none',
      promotions: 'none', analytics: 'orders_basic', apiAccess: false, multiUserAccounts: false,
      adsTools: 'none', support: 'standard_24h',
    },
  },
  growth: {
    id: 'growth', name: 'Growth', price: 2000, commissionRate: 5, commissionLabel: '5%',
    badge: 'MOST POPULAR',
    features: {
      maxProducts: 100, storefront: 'advanced_logo_banners', marketAccess: 'domestic_international',
      searchRanking: 'medium_priority', featuredPlacement: 'paid_addon_limited', verifiedBadge: 'paid_addon',
      buyerMessaging: 'full', fileSharing: true, dailyConversationLimit: -1,
      bulkOrderTools: 'enabled', promotions: 'enabled', analytics: 'sales_conversion_advanced',
      apiAccess: false, multiUserAccounts: false, adsTools: 'limited', support: 'priority_24h',
    },
  },
  pro: {
    id: 'pro', name: 'Pro', price: 3000, commissionRate: 2.5, commissionLabel: '2–3%',
    features: {
      maxProducts: -1, storefront: 'full_branding_custom_layout', marketAccess: 'global_priority',
      searchRanking: 'highest', featuredPlacement: 'included_homepage_categories', verifiedBadge: 'included',
      buyerMessaging: 'priority_inbox', fileSharing: true, dailyConversationLimit: -1,
      bulkOrderTools: 'advanced_automation', promotions: 'advanced_campaigns', analytics: 'traffic_behavior_roi_full',
      apiAccess: true, multiUserAccounts: true, adsTools: 'full', support: 'vip_24h_dedicated_manager',
    },
  },
};

export const PLAN_ORDER: PlanType[] = ['starter', 'growth', 'pro'];
export function getPlan(planType: PlanType): Plan { return PLANS[planType]; }
export function getPlanRank(planType: PlanType): number { return PLAN_ORDER.indexOf(planType); }
export function isUpgrade(from: PlanType, to: PlanType): boolean { return getPlanRank(to) > getPlanRank(from); }
export function commissionSavings(currentPlan: PlanType, targetPlan: PlanType, sampleAmount = 10000): number {
  const current = PLANS[currentPlan].commissionRate;
  const target = PLANS[targetPlan].commissionRate;
  return Math.max(0, ((current - target) / 100) * sampleAmount);
}
