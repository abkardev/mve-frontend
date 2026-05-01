import type { User } from './index';

export type PlanType = 'starter' | 'growth' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'pending' | 'past_due';

export interface PlanFeatures {
  maxProducts: number; // -1 = unlimited
  storefront: 'basic_logo_only' | 'advanced_logo_banners' | 'full_branding_custom_layout';
  marketAccess: 'domestic_international' | 'global_priority';
  searchRanking: 'low' | 'medium_priority' | 'highest';
  featuredPlacement: 'none' | 'paid_addon_limited' | 'included_homepage_categories';
  verifiedBadge: 'none' | 'paid_addon' | 'included';
  buyerMessaging: 'limited' | 'full' | 'priority_inbox';
  fileSharing: boolean;
  dailyConversationLimit: number; // -1 = unlimited
  bulkOrderTools: 'none' | 'enabled' | 'advanced_automation';
  promotions: 'none' | 'enabled' | 'advanced_campaigns';
  analytics: 'orders_basic' | 'sales_conversion_advanced' | 'traffic_behavior_roi_full';
  apiAccess: boolean;
  multiUserAccounts: boolean;
  adsTools: 'none' | 'limited' | 'full';
  support: 'standard_24h' | 'priority_24h' | 'vip_24h_dedicated_manager';
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  commissionRate: number;
  commissionLabel: string;
  badge?: string;
  features: PlanFeatures;
}

export interface Subscription {
  _id: string;
  userId: string | User;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  commissionRate: number;
  features: PlanFeatures;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  autoRenew: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPaymentMethod = 'visa' | 'mastercard' | 'bank_transfer';
export interface CreateCheckoutRequest { planType: PlanType; paymentMethod?: SubscriptionPaymentMethod; }
export interface CheckoutResponse { checkoutUrl: string | null; sessionId: string; paymentMethod?: SubscriptionPaymentMethod; instructions?: Record<string, string | number>; }
export interface SubscriptionAnalytics {
  totalSubscribers: number;
  byPlan: Record<PlanType, number>;
  monthlyRevenue: number;
  churnRate: number;
  upgrades: number;
  downgrades: number;
}
