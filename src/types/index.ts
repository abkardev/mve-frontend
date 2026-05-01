// Bilingual text type
export interface BilingualText {
  en: string;
  ar?: string;
}

// User roles
export type UserRole = 'user' | 'vendor' | 'admin';

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Vendor type
export interface Vendor {
  _id: string;
  user: string | User;
  storeName: BilingualText;
  storeDescription: BilingualText;
  slug: string;
  storeImage?: string;
  storeBanner?: string;
  isVerified?: boolean;
  responseRate?: number;
  responseTime?: string;
  yearsInBusiness?: number;
  mainProducts?: string[];
  address?: {
    country?: string;
    city?: string;
    street?: string;
  };
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Category type
export interface Category {
  _id: string;
  name: BilingualText;
  slug: string;
  image?: string;
  parent?: string | Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product type
export interface Product {
  _id: string;
  vendor: string | Vendor;
  name: BilingualText;
  description: BilingualText;
  category: string | Category;
  images: string[];
  price: {
    min: number;
    max?: number;
    currency: string;
  };
  moq: number;
  unit: string;
  specifications?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Announcement/RFQ type
export interface Announcement {
  _id: string;
  buyer: string | User;
  title: BilingualText;
  description: BilingualText;
  category?: string | Category;
  quantity: number;
  unit?: string;
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  deadline?: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'closed' | 'expired';
  responses: AnnouncementResponse[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementResponse {
  vendor: string | Vendor;
  message: string;
  quotedPrice?: number;
  respondedAt: string;
}

// Chat types
export interface Chat {
  _id: string;
  participants: (string | User)[];
  vendor?: string | Vendor;
  announcement?: string | Announcement;
  lastMessage?: string | Message;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chat: string | Chat;
  sender: string | User;
  content: string;
  isRead: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
