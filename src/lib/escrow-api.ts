import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  Order, Payment, Wallet, Transaction, Dispute, WithdrawalRequest,
  CreatePaymentRequest, ConfirmDeliveryRequest, OpenDisputeRequest,
  UpdateShippingRequest, WithdrawRequest, ResolveDisputeRequest,
} from '@/types/escrow';

// Orders
export const orderApi = {
  getAll: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Order>>('/order', { params }),
  
  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/order/${id}`),
  
  getMyOrders: (role: 'buyer' | 'vendor', params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Order>>(`/order/my/${role}`, { params }),
};

// Payments
export const paymentApi = {
  create: (data: CreatePaymentRequest) =>
    apiClient.post<ApiResponse<{ payment: Payment; checkoutUrl?: string }>>('/payment/create', data),
  
  getByOrder: (orderId: string) =>
    apiClient.get<ApiResponse<Payment>>(`/payment/order/${orderId}`),
};

// Escrow actions
export const escrowApi = {
  confirmDelivery: (data: ConfirmDeliveryRequest) =>
    apiClient.post<ApiResponse<Order>>('/escrow/confirm-delivery', data),
  
  releaseFunds: (orderId: string) =>
    apiClient.post<ApiResponse<Order>>('/escrow/release-funds', { orderId }),
  
  updateShipping: (data: UpdateShippingRequest) =>
    apiClient.post<ApiResponse<Order>>('/escrow/update-shipping', data),
};

// Wallet
export const walletApi = {
  getMyWallet: () =>
    apiClient.get<ApiResponse<Wallet>>('/wallet/me'),
  
  getTransactions: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Transaction>>('/wallet/transactions', { params }),
  
  withdraw: (data: WithdrawRequest) =>
    apiClient.post<ApiResponse<WithdrawalRequest>>('/wallet/withdraw', data),
  
  getWithdrawals: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<WithdrawalRequest>>('/wallet/withdrawals', { params }),
};

// Disputes
export const disputeApi = {
  open: (data: FormData) =>
    apiClient.post<ApiResponse<Dispute>>('/dispute/open', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getById: (id: string) =>
    apiClient.get<ApiResponse<Dispute>>(`/dispute/${id}`),
  
  getAll: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Dispute>>('/dispute', { params }),
  
  getMyDisputes: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<Dispute>>('/dispute/my', { params }),
  
  resolve: (data: ResolveDisputeRequest) =>
    apiClient.post<ApiResponse<Dispute>>('/dispute/resolve', data),
  
  addEvidence: (disputeId: string, data: FormData) =>
    apiClient.post<ApiResponse<Dispute>>(`/dispute/${disputeId}/evidence`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
