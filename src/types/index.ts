export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  date: string;
  payee: string;
  amount: number;
  source: 'manual' | 'bank';
  checkNumber?: string;
  notes?: string;
  reconciled: boolean;
  runningBalance: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  bankName: string;
  accountNumber: string; // Last 4 digits only
  isActive: boolean;
  startingBalance: number;
  startingBalanceDate: string;
  currentBalance: number;
  color: string; // For visual distinction
  plaidAccessToken?: string; // For Plaid-connected accounts
}

export interface UserSettings {
  startDate: string;
  monthlyResetEnabled: boolean;
  lastBalance: number;
  bankLinked: boolean;
  activeAccountId: string;
  hasAcceptedTerms: boolean;
  termsAcceptedDate?: string;
  hasAcceptedPrivacy: boolean;
  privacyAcceptedDate?: string;
}

export type FilterType = 'all' | 'manual' | 'bank' | 'reconciled' | 'unreconciled';

export interface Budget {
  id: string;
  name: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
  color: string;
  isActive: boolean;
  createdDate: string;
}

export interface BudgetSpending {
  budgetId: string;
  spent: number;
  remaining: number;
  percentUsed: number;
}