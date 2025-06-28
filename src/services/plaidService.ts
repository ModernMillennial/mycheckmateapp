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
  private baseUrl = 'https://production.plaid.com';
  private clientId = process.env.EXPO_PUBLIC_PLAID_CLIENT_ID;
  private secret = process.env.EXPO_PUBLIC_PLAID_SECRET;
  private isConfigured = false;

  constructor() {
    this.isConfigured = !!(this.clientId && this.secret);
    if (!this.isConfigured) {
      console.warn('Plaid credentials not configured. App will run in demo mode.');
    }
  }

  isPlaidConfigured(): boolean {
    return this.isConfigured;
  }

  async createLinkToken(userId: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Plaid credentials not configured. Running in demo mode.');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(`Plaid API error: ${data.error_code} - ${data.error_message}`);
      }

      return data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  async exchangePublicToken(publicToken: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Plaid credentials not configured. Running in demo mode.');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(`Plaid API error: ${data.error_code} - ${data.error_message}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    if (!this.isConfigured) {
      throw new Error('Plaid credentials not configured. Running in demo mode.');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(`Plaid API error: ${data.error_code} - ${data.error_message}`);
      }

      return data.accounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getTransactions(
    accessToken: string, 
    accountIds: string[], 
    startDate: string, 
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (!this.isConfigured) {
      throw new Error('Plaid credentials not configured. Running in demo mode.');
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error_code) {
        throw new Error(`Plaid API error: ${data.error_code} - ${data.error_message}`);
      }

      return data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
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


}

// Create a safe instance that won't throw on initialization
let _plaidService: PlaidService | null = null;

export const plaidService = {
  isPlaidConfigured(): boolean {
    try {
      if (!_plaidService) {
        _plaidService = new PlaidService();
      }
      return _plaidService.isPlaidConfigured();
    } catch (error) {
      console.warn('Plaid service initialization failed:', error);
      return false;
    }
  },

  async createLinkToken(userId: string): Promise<string> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.createLinkToken(userId);
  },

  async exchangePublicToken(publicToken: string): Promise<string> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.exchangePublicToken(publicToken);
  },

  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.getAccounts(accessToken);
  },

  async getTransactions(
    accessToken: string, 
    accountIds: string[], 
    startDate: string, 
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.getTransactions(accessToken, accountIds, startDate, endDate);
  },

  convertPlaidTransactionToApp(plaidTx: PlaidTransaction, userId: string): Omit<Transaction, 'id' | 'runningBalance'> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.convertPlaidTransactionToApp(plaidTx, userId);
  }
};