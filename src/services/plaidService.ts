import { Transaction } from '../types';

export interface PlaidAccount {
  account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
  mask: string;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category: string[];
  account_owner: string | null;
}

export interface PlaidLinkResult {
  publicToken: string;
  metadata: {
    institution: {
      name: string;
      institution_id: string;
    };
    accounts: PlaidAccount[];
  };
}

class PlaidService {
  private baseUrl = 'https://production.plaid.com'; // Change to sandbox for testing
  private clientId = process.env.EXPO_PUBLIC_PLAID_CLIENT_ID;
  private secret = process.env.EXPO_PUBLIC_PLAID_SECRET;

  constructor() {
    if (!this.clientId || !this.secret) {
      console.warn('Plaid credentials not found. Using mock data.');
    }
  }

  async createLinkToken(userId: string): Promise<string> {
    if (!this.clientId || !this.secret) {
      return this.mockLinkToken();
    }

    try {
      const response = await fetch(`${this.baseUrl}/link/token/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          client_name: 'Checkmate',
          user: {
            client_user_id: userId,
          },
          products: ['transactions'],
          country_codes: ['US'],
          language: 'en',
        }),
      });

      const data = await response.json();
      return data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      return this.mockLinkToken();
    }
  }

  async exchangePublicToken(publicToken: string): Promise<string | null> {
    if (!this.clientId || !this.secret) {
      return this.mockAccessToken();
    }

    try {
      const response = await fetch(`${this.baseUrl}/link/token/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          public_token: publicToken,
        }),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      return this.mockAccessToken();
    }
  }

  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    if (!this.clientId || !this.secret) {
      return this.mockAccounts();
    }

    try {
      const response = await fetch(`${this.baseUrl}/accounts/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          access_token: accessToken,
        }),
      });

      const data = await response.json();
      return data.accounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return this.mockAccounts();
    }
  }

  async getTransactions(
    accessToken: string, 
    accountIds: string[], 
    startDate: string, 
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (!this.clientId || !this.secret) {
      return this.mockTransactions(accountIds[0]);
    }

    try {
      const response = await fetch(`${this.baseUrl}/transactions/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          account_ids: accountIds,
        }),
      });

      const data = await response.json();
      return data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return this.mockTransactions(accountIds[0]);
    }
  }

  convertPlaidTransactionToApp(plaidTx: PlaidTransaction, userId: string): Omit<Transaction, 'id' | 'runningBalance'> {
    return {
      userId,
      accountId: plaidTx.account_id,
      date: plaidTx.date,
      payee: plaidTx.merchant_name || plaidTx.name,
      amount: -plaidTx.amount, // Plaid amounts are positive for debits, we want negative
      source: 'bank',
      notes: plaidTx.category.join(', '),
      reconciled: true,
    };
  }

  // Mock methods for when Plaid credentials are not available
  private mockLinkToken(): string {
    return 'link-sandbox-mock-token';
  }

  private mockAccessToken(): string {
    return 'access-sandbox-mock-token';
  }

  private mockAccounts(): PlaidAccount[] {
    return [
      {
        account_id: 'plaid_checking_001',
        name: 'Plaid Checking',
        official_name: 'Plaid Gold Standard 0% Interest Checking',
        type: 'depository',
        subtype: 'checking',
        balances: {
          available: 1200.50,
          current: 1200.50,
          limit: null,
        },
        mask: '0000',
      },
      {
        account_id: 'plaid_savings_001',
        name: 'Plaid Savings',
        official_name: 'Plaid Silver Standard 0.1% Interest Savings',
        type: 'depository',
        subtype: 'savings',
        balances: {
          available: 5432.10,
          current: 5432.10,
          limit: null,
        },
        mask: '1111',
      },
    ];
  }

  private mockTransactions(accountId: string): PlaidTransaction[] {
    const baseDate = new Date();
    return [
      {
        transaction_id: 'plaid_tx_001',
        account_id: accountId,
        amount: 4.33,
        date: new Date(baseDate.getTime() - 86400000 * 1).toISOString().split('T')[0],
        name: 'Starbucks',
        merchant_name: 'Starbucks',
        category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
        account_owner: null,
      },
      {
        transaction_id: 'plaid_tx_002',
        account_id: accountId,
        amount: 89.40,
        date: new Date(baseDate.getTime() - 86400000 * 2).toISOString().split('T')[0],
        name: 'Shell Oil',
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        account_owner: null,
      },
      {
        transaction_id: 'plaid_tx_003',
        account_id: accountId,
        amount: -2500.00, // Negative for deposits in Plaid
        date: new Date(baseDate.getTime() - 86400000 * 3).toISOString().split('T')[0],
        name: 'PAYROLL DEPOSIT',
        category: ['Deposit', 'Payroll'],
        account_owner: null,
      },
      {
        transaction_id: 'plaid_tx_004',
        account_id: accountId,
        amount: 156.78,
        date: new Date(baseDate.getTime() - 86400000 * 4).toISOString().split('T')[0],
        name: 'Grocery Store Purchase',
        merchant_name: 'Whole Foods Market',
        category: ['Shops', 'Food and Beverage Store', 'Supermarkets and Groceries'],
        account_owner: null,
      },
    ];
  }
}

export const plaidService = new PlaidService();