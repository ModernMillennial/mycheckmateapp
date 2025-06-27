export interface Transaction {
  id: string;
  userId: string;
  date: string;
  payee: string;
  amount: number;
  source: 'manual' | 'bank';
  checkNumber?: string;
  notes?: string;
  reconciled: boolean;
  runningBalance: number;
}

export interface UserSettings {
  startDate: string;
  monthlyResetEnabled: boolean;
  lastBalance: number;
  bankLinked: boolean;
}

export type FilterType = 'all' | 'manual' | 'bank' | 'reconciled' | 'unreconciled';