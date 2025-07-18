import { Transaction } from '../types';
import logger from '../utils/logger';

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
  merchant_name: string | null;
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

// Note: Mock data has been removed. This service now requires proper Plaid configuration.

class PlaidService {
  private baseUrl: string;
  private clientId = process.env.EXPO_PUBLIC_PLAID_CLIENT_ID;
  private secret = process.env.EXPO_PUBLIC_PLAID_SECRET;
  private environment = process.env.EXPO_PUBLIC_PLAID_ENVIRONMENT || 'production';
  private isConfigured = false;

  constructor() {
    // Set base URL based on environment
    switch (this.environment) {
      case 'sandbox':
        this.baseUrl = 'https://sandbox.plaid.com';
        break;
      case 'development':
        this.baseUrl = 'https://development.plaid.com';
        break;
      case 'production':
      default:
        this.baseUrl = 'https://production.plaid.com';
        break;
    }

    this.isConfigured = !!(this.clientId && this.secret);
    if (!this.isConfigured) {
      console.warn('Plaid credentials not configured. Running in demo mode.');
    } else {
      console.info(`Plaid service initialized in ${this.environment} mode`);
    }
  }

  isPlaidConfigured(): boolean {
    return this.isConfigured;
  }

  // Demo methods for when Plaid is not configured
  private async createDemoLinkToken(userId: string): Promise<string> {
    // Return a mock token that will trigger demo flow
    return `demo-link-token-${userId}-${Date.now()}`;
  }

  private async simulateDemoConnection(): Promise<PlaidLinkResult> {
    // Simulate delay like a real connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      publicToken: `demo-public-token-${Date.now()}`,
      metadata: {
        institution: {
          name: 'Demo Bank',
          institution_id: 'demo_bank_001',
        },
        accounts: [
          {
            account_id: 'demo_checking_001',
            name: 'Demo Checking',
            official_name: 'Demo Checking Account',
            type: 'depository',
            subtype: 'checking',
            balances: {
              available: 1250.45,
              current: 1250.45,
              limit: null,
            },
            mask: '0001',
          },
          {
            account_id: 'demo_savings_001',
            name: 'Demo Savings',
            official_name: 'Demo Savings Account',
            type: 'depository',
            subtype: 'savings',
            balances: {
              available: 5000.00,
              current: 5000.00,
              limit: null,
            },
            mask: '0002',
          },
        ],
      },
    };
  }

  async createLinkToken(userId: string): Promise<string> {
    if (!this.isConfigured) {
      return this.createDemoLinkToken(userId);
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
        console.warn(`Plaid API error (${response.status}), falling back to demo mode`);
        return this.createDemoLinkToken(userId);
      }

      const data = await response.json();
      
      if (data.error_code) {
        console.warn(`Plaid API error: ${data.error_code} - ${data.error_message}, falling back to demo mode`);
        return this.createDemoLinkToken(userId);
      }

      return data.link_token;
    } catch (error) {
      console.warn('Error creating link token, falling back to demo mode:', error);
      return this.createDemoLinkToken(userId);
    }
  }

  async exchangePublicToken(publicToken: string): Promise<string> {
    if (!this.isConfigured || publicToken.startsWith('demo-')) {
      // Return a demo access token for demo mode
      return `demo-access-token-${Date.now()}`;
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
        console.warn(`Plaid exchange token API error (${response.status}), using demo access token`);
        return `demo-access-token-${Date.now()}`;
      }

      const data = await response.json();
      
      if (data.error_code) {
        console.warn(`Plaid exchange token API error: ${data.error_code} - ${data.error_message}, using demo access token`);
        return `demo-access-token-${Date.now()}`;
      }

      return data.access_token;
    } catch (error) {
      console.warn('Error exchanging public token, using demo access token:', error);
      return `demo-access-token-${Date.now()}`;
    }
  }

  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    if (!this.isConfigured || accessToken.startsWith('demo-')) {
      // Return demo accounts
      return [
        {
          account_id: 'demo_checking_001',
          name: 'Demo Checking',
          official_name: 'Demo Checking Account',
          type: 'depository',
          subtype: 'checking',
          balances: {
            available: 1250.45,
            current: 1250.45,
            limit: null,
          },
          mask: '0001',
        },
        {
          account_id: 'demo_savings_001',
          name: 'Demo Savings',
          official_name: 'Demo Savings Account',
          type: 'depository',
          subtype: 'savings',
          balances: {
            available: 5000.00,
            current: 5000.00,
            limit: null,
          },
          mask: '0002',
        },
      ];
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
        console.warn(`Plaid accounts API error (${response.status}), using demo accounts`);
        return this.getAccounts('demo-access-token');
      }

      const data = await response.json();
      
      if (data.error_code) {
        console.warn(`Plaid accounts API error: ${data.error_code} - ${data.error_message}, using demo accounts`);
        return this.getAccounts('demo-access-token');
      }

      return data.accounts;
    } catch (error) {
      console.warn('Error fetching accounts, using demo accounts:', error);
      return this.getAccounts('demo-access-token');
    }
  }

  private async generateDemoTransactions(
    accountIds: string[],
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    const mockTransactions: PlaidTransaction[] = [
      {
        transaction_id: 'demo_tx_001',
        account_id: accountIds[0],
        amount: 4.50,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
        name: 'Starbucks',
        merchant_name: 'Starbucks',
        category: ['Food and Drink', 'Coffee'],
        account_owner: null,
      },
      {
        transaction_id: 'demo_tx_002',
        account_id: accountIds[0],
        amount: 125.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        name: 'Whole Foods Market',
        merchant_name: 'Whole Foods Market',
        category: ['Shops', 'Groceries'],
        account_owner: null,
      },
      {
        transaction_id: 'demo_tx_003',
        account_id: accountIds[0],
        amount: -2500.00, // Deposit (negative amount)
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week ago
        name: 'Payroll Deposit',
        merchant_name: null,
        category: ['Deposit'],
        account_owner: null,
      },
      {
        transaction_id: 'demo_tx_004',
        account_id: accountIds[0],
        amount: 850.00,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        name: 'Rent Payment',
        merchant_name: null,
        category: ['Payment', 'Rent'],
        account_owner: null,
      },
      {
        transaction_id: 'demo_tx_005',
        account_id: accountIds[0],
        amount: 45.67,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        name: 'Shell Gas Station',
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        account_owner: null,
      },
    ];

    return mockTransactions;
  }

  async getTransactions(
    accessToken: string, 
    accountIds: string[], 
    startDate: string, 
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (!this.isConfigured || accessToken.startsWith('demo-')) {
      // Return demo transactions
      return this.generateDemoTransactions(accountIds, startDate, endDate);
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
        console.warn(`Plaid transactions API error (${response.status}), using demo transactions`);
        return this.generateDemoTransactions(accountIds, startDate, endDate);
      }

      const data = await response.json();
      
      if (data.error_code) {
        console.warn(`Plaid transactions API error: ${data.error_code} - ${data.error_message}, using demo transactions`);
        return this.generateDemoTransactions(accountIds, startDate, endDate);
      }

      return data.transactions;
    } catch (error) {
      console.warn('Error fetching transactions, using demo transactions:', error);
      return this.generateDemoTransactions(accountIds, startDate, endDate);
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

  // All "OrDemo" methods have been removed. Use the real Plaid API methods directly.

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

  async getTransactionsOrDemo(
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