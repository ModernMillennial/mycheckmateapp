import { Transaction } from '../types';

export const generateSeedTransactions = (): Omit<Transaction, 'id' | 'runningBalance'>[] => [
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], // 7 days ago
    payee: 'Grocery Store',
    amount: -125.67,
    source: 'manual',
    checkNumber: '1001',
    notes: 'Weekly grocery shopping',
    reconciled: true,
  },
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
    payee: 'Monthly Salary',
    amount: 3250.00,
    source: 'bank',
    notes: 'Direct deposit payroll',
    reconciled: false,
  },
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], // 4 days ago
    payee: 'Electric Bill',
    amount: -89.45,
    source: 'manual',
    checkNumber: '1002',
    notes: 'Monthly utility payment',
    reconciled: false,
  },
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    payee: 'Coffee Shop',
    amount: -12.50,
    source: 'bank',
    notes: 'Morning coffee',
    reconciled: false,
  },
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    payee: 'Gas Station',
    amount: -45.00,
    source: 'manual',
    notes: 'Fill up tank',
    reconciled: true,
  },
  {
    userId: 'user-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    payee: 'ATM Withdrawal',
    amount: -100.00,
    source: 'bank',
    notes: 'Cash withdrawal',
    reconciled: false,
  },
];