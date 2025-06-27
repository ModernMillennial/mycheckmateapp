import { Transaction } from '../types';

export const generateSeedTransactions = (): Omit<Transaction, 'id' | 'runningBalance'>[] => [
  // Manual transaction that will be matched by bank sync
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], // 7 days ago
    payee: 'Grocery Store',
    amount: -125.67,
    source: 'manual',
    checkNumber: '1001',
    notes: 'Weekly grocery shopping',
    reconciled: false, // Will be auto-reconciled when bank sync finds matching transaction
  },
  // Bank transaction - auto reconciled
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
    payee: 'Payroll Direct Deposit',
    amount: 3250.00,
    source: 'bank',
    notes: 'Monthly salary deposit',
    reconciled: true, // Bank transactions are always reconciled
  },
  // Manual transaction that hasn't cleared yet
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], // 4 days ago
    payee: 'Electric Company',
    amount: -89.45,
    source: 'manual',
    checkNumber: '1002',
    notes: 'Monthly utility payment - Check mailed',
    reconciled: false, // Still pending - check hasn't cleared
  },
  // Bank transaction - auto reconciled
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    payee: 'Starbucks Coffee',
    amount: -12.50,
    source: 'bank',
    notes: 'Card purchase',
    reconciled: true, // Bank transactions are always reconciled
  },
  // Manual transaction that will match upcoming bank sync
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    payee: 'Shell Gas Station',
    amount: -45.00,
    source: 'manual',
    checkNumber: '1003',
    notes: 'Fill up tank',
    reconciled: false, // Will be matched during bank sync
  },
  // Recent manual transaction - too new to have cleared
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date().toISOString().split('T')[0], // Today
    payee: 'Local Restaurant',
    amount: -28.75,
    source: 'manual',
    notes: 'Lunch - Card payment',
    reconciled: false, // Too recent to have cleared
  },
  // Demo manual transaction to show gray circles
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    payee: 'Coffee Shop',
    amount: -5.25,
    source: 'manual',
    notes: 'Morning coffee - manual entry demo',
    reconciled: false,
  },
  // Another demo manual transaction
  {
    userId: 'user-1',
    accountId: 'checking-1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow (future dated)
    payee: 'Parking Meter',
    amount: -2.00,
    source: 'manual',
    notes: 'Downtown parking',
    reconciled: false,
  },
  // Some savings account transactions
  {
    userId: 'user-1',
    accountId: 'savings-1', 
    date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    payee: 'Transfer from Checking',
    amount: 500.00,
    source: 'bank',
    notes: 'Monthly savings transfer',
    reconciled: true,
  },
  {
    userId: 'user-1',
    accountId: 'savings-1',
    date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
    payee: 'Interest Payment',
    amount: 15.50,
    source: 'bank',
    notes: 'Monthly interest',
    reconciled: true,
  },
];