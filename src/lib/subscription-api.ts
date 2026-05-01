import { apiClient } from './api';
import type { ApiResponse } from '@/types';
import type {
  Subscription, CreateCheckoutRequest, CheckoutResponse,
  SubscriptionAnalytics, PlanType,
} from '@/types/subscription';

export const subscriptionApi = {
  getMine: () => apiClient.get<ApiResponse<Subscription | null>>('/subscription/me'),
  createCheckout: (data: CreateCheckoutRequest) =>
    apiClient.post<ApiResponse<CheckoutResponse>>('/subscription/checkout', data),
  cancel: () => apiClient.post<ApiResponse<Subscription>>('/subscription/cancel'),
  changePlan: (planType: PlanType) =>
    apiClient.post<ApiResponse<{ checkoutUrl: string }>>('/subscription/change-plan', { planType }),
  adminList: (params?: Record<string, string>) =>
    apiClient.get<ApiResponse<Subscription[]>>('/admin/subscriptions', { params }),
  adminAssign: (vendorId: string, planType: PlanType, commissionOverride?: number) =>
    apiClient.post<ApiResponse<Subscription>>('/admin/subscriptions/assign',
      { vendorId, planType, commissionOverride }),
  adminAnalytics: () =>
    apiClient.get<ApiResponse<SubscriptionAnalytics>>('/admin/subscriptions/analytics'),
};
