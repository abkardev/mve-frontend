import type { User, Vendor, BilingualText } from './index';

// Currency types
export type Currency = 'USD' | 'SAR' | 'EUR';

// Payment methods
export type PaymentMethod = 'visa' | 'mastercard' | 'bank_transfer';

// Order statuses
export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'in_escrow'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded';

// Dispute statuses
export type DisputeStatus = 'open' | 'under_review' | 'resolved_refund' | 'resolved_release' | 'closed';

// Transaction types
export type TransactionType =
  | 'payment'
  | 'escrow_hold'
  | 'escrow_release'
  | 'refund'
  | 'withdrawal'
  | 'withdrawal_fee';

// Order
export interface Order {
  _id: string;
  orderNumber: string;
  buyer: string | User;
  vendor: string | Vendor;
  items: OrderItem[];
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  shippingDetails?: ShippingDetails;
  escrowReleasedAt?: string;
  autoReleaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: BilingualText;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingDetails {
  carrier: string;
  trackingNumber: string;
  shippedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

// Payment
export interface Payment {
  _id: string;
  order: string | Order;
  buyer: string | User;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  gatewayRef?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Wallet
export interface Wallet {
  _id: string;
  user: string | User;
  availableBalance: number;
  pendingBalance: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

// Transaction (ledger entry)
export interface Transaction {
  _id: string;
  wallet: string | Wallet;
  user: string | User;
  type: TransactionType;
  amount: number;
  currency: Currency;
  balance: number; // balance after transaction
  reference?: string; // order ID or payment ID
  description: string;
  createdAt: string;
}

// Dispute
export interface Dispute {
  _id: string;
  order: string | Order;
  buyer: string | User;
  vendor: string | Vendor;
  reason: string;
  description: string;
  evidence: DisputeEvidence[];
  status: DisputeStatus;
  adminNotes?: string;
  resolution?: {
    decision: 'refund' | 'release';
    amount: number;
    resolvedBy: string | User;
    resolvedAt: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DisputeEvidence {
  type: 'image' | 'document' | 'note';
  url?: string;
  note?: string;
  uploadedAt: string;
}

// Withdrawal request
export interface WithdrawalRequest {
  _id: string;
  user: string | User;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
  };
  processedAt?: string;
  createdAt: string;
}

// API request/response types
export interface CreatePaymentRequest {
  orderId: string;
  method: PaymentMethod;
  currency: Currency;
}

export interface ConfirmDeliveryRequest {
  orderId: string;
}

export interface OpenDisputeRequest {
  orderId: string;
  reason: string;
  description: string;
  evidence?: File[];
}

export interface UpdateShippingRequest {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
}

export interface WithdrawRequest {
  amount: number;
  currency: Currency;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
  };
}

export interface ResolveDisputeRequest {
  disputeId: string;
  decision: 'refund' | 'release';
  amount: number;
  notes: string;
}
