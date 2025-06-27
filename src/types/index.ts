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
  currentBalance: number;
  color: string; // For visual distinction
}

export interface UserSettings {
  startDate: string;
  monthlyResetEnabled: boolean;
  lastBalance: number;
  bankLinked: boolean;
  activeAccountId: string;
}

export type FilterType = 'all' | 'manual' | 'bank' | 'reconciled' | 'unreconciled';