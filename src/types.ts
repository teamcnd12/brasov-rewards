export interface Transaction {
  id: number;
  date: string;
  amountSpent: number;
  tokensEarned: number;
  timestamp: string;
  addedBy?: string;
  staffId?: string;
}

export interface ActivityLogEntry {
  id: number;
  date: string;
  time: string;
  action: 'added_tokens' | 'verified_redemption' | 'removed_tokens';
  customerId?: string;
  customerName?: string;
  details: string;
}

export interface User {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  tokenBalance?: number;
  totalTokensEarned?: number;
  totalSpent?: number;
  memberSince: string;
  transactions?: Transaction[];
  createdBy?: string;
  tokensAddedToday?: number;
  redemptionsVerifiedToday?: number;
  activityLog?: ActivityLogEntry[];
}

export interface Reward {
  id: number;
  name: string;
  tokenCost: number;
  imageUrl: string;
}

export interface RedemptionCode {
  code: string;
  userId: string;
  rewardId: number;
  expiresAt: Date;
  redeemed: boolean;
  createdAt: Date;
}

export type ViewMode = 'customer' | 'staff';
export type CustomerPage = 'home' | 'rewards' | 'profile';

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface FormErrors {
  [key: string]: string;
}
