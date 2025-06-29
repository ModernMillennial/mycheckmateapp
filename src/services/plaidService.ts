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

export interface MockBankInstitution {
  id: string;
  name: string;
  logo: string;
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
}

// Comprehensive mock bank data for demo mode
const MOCK_INSTITUTIONS: MockBankInstitution[] = [
  {
    id: 'ins_demo_chase',
    name: 'Chase Bank (Demo)',
    logo: '🏦',
    accounts: [
      {
        account_id: 'acc_demo_chase_checking',
        name: 'Chase Total Checking',
        official_name: 'Chase Total Checking (...4521)',
        type: 'depository',
        subtype: 'checking',
        balances: {
          available: 2847.50,
          current: 2847.50,
          limit: null,
        },
        mask: '4521',
      },
      {
        account_id: 'acc_demo_chase_savings',
        name: 'Chase Savings',
        official_name: 'Chase Savings (...7890)',
        type: 'depository',
        subtype: 'savings',
        balances: {
          available: 15420.75,
          current: 15420.75,
          limit: null,
        },
        mask: '7890',
      },
    ],
    transactions: [
      {
        transaction_id: 'tx_demo_chase_1',
        account_id: 'acc_demo_chase_checking',
        amount: 89.43,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Whole Foods Market',
        merchant_name: 'Whole Foods Market',
        category: ['Shops', 'Food and Drink', 'Groceries'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_chase_2',
        account_id: 'acc_demo_chase_checking',
        amount: 4.95,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Starbucks',
        merchant_name: 'Starbucks',
        category: ['Shops', 'Food and Drink', 'Coffee Shop'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_chase_3',
        account_id: 'acc_demo_chase_checking',
        amount: 1250.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Rent Payment',
        merchant_name: 'Property Management Co',
        category: ['Payment', 'Rent'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_chase_4',
        account_id: 'acc_demo_chase_checking',
        amount: -2800.00,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Paycheck Deposit',
        merchant_name: 'ACME Corp',
        category: ['Deposit', 'Payroll'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_chase_5',
        account_id: 'acc_demo_chase_checking',
        amount: 65.23,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Shell Gas Station',
        merchant_name: 'Shell',
        category: ['Transportation', 'Gas Stations'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_chase_6',
        account_id: 'acc_demo_chase_checking',
        amount: 29.99,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Netflix',
        merchant_name: 'Netflix',
        category: ['Service', 'Entertainment', 'Digital Entertainment'],
        account_owner: null,
      },
    ],
  },
  {
    id: 'ins_demo_bofa',
    name: 'Bank of America (Demo)', 
    logo: '🏛️',
    accounts: [
      {
        account_id: 'acc_demo_bofa_checking',
        name: 'Bank of America Core Checking',
        official_name: 'BofA Core Checking (...1234)',
        type: 'depository',
        subtype: 'checking',
        balances: {
          available: 1156.78,
          current: 1156.78,
          limit: null,
        },
        mask: '1234',
      },
      {
        account_id: 'acc_demo_bofa_credit',
        name: 'BofA Cash Rewards Credit Card',
        official_name: 'BofA Cash Rewards (...5678)',
        type: 'credit',
        subtype: 'credit card',
        balances: {
          available: 4500.00,
          current: -342.85,
          limit: 5000.00,
        },
        mask: '5678',
      },
    ],
    transactions: [
      {
        transaction_id: 'tx_demo_bofa_1',
        account_id: 'acc_demo_bofa_checking',
        amount: 12.50,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'McDonald\'s',
        merchant_name: 'McDonald\'s',
        category: ['Shops', 'Food and Drink', 'Fast Food'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_bofa_2',
        account_id: 'acc_demo_bofa_credit',
        amount: 156.78,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Amazon.com',
        merchant_name: 'Amazon',
        category: ['Shops', 'Digital Purchase'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_bofa_3',
        account_id: 'acc_demo_bofa_checking',
        amount: 45.00,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Electric Company',
        merchant_name: 'PG&E',
        category: ['Bills', 'Utilities', 'Electric'],
        account_owner: null,
      },
    ],
  },
  {
    id: 'ins_demo_wells',
    name: 'Wells Fargo (Demo)',
    logo: '🏪',
    accounts: [
      {
        account_id: 'acc_demo_wells_checking',
        name: 'Wells Fargo Everyday Checking',
        official_name: 'WF Everyday Checking (...9876)',
        type: 'depository', 
        subtype: 'checking',
        balances: {
          available: 542.19,
          current: 542.19,
          limit: null,
        },
        mask: '9876',
      }
    ],
    transactions: [
      {
        transaction_id: 'tx_demo_wells_1',
        account_id: 'acc_demo_wells_checking',
        amount: 95.20,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Target',
        merchant_name: 'Target',
        category: ['Shops', 'General Merchandise', 'Department Stores'],
        account_owner: null,
      },
      {
        transaction_id: 'tx_demo_wells_2',
        account_id: 'acc_demo_wells_checking',
        amount: 8.75,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        name: 'Dunkin\'',
        merchant_name: 'Dunkin\'',
        category: ['Shops', 'Food and Drink', 'Coffee Shop'],
        account_owner: null,
      },
    ],
  },
];

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

  // Demo mode methods
  getMockInstitutions(): MockBankInstitution[] {
    return MOCK_INSTITUTIONS;
  }

  async createDemoLinkFlow(): Promise<PlaidLinkResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return first institution as default demo connection
    const demoInstitution = MOCK_INSTITUTIONS[0];
    
    return {
      publicToken: 'demo_public_token_' + Date.now(),
      metadata: {
        institution: {
          name: demoInstitution.name,
          institution_id: demoInstitution.id,
        },
        accounts: demoInstitution.accounts,
      },
    };
  }

  async exchangeDemoPublicToken(publicToken: string, institutionId?: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedInstitution = institutionId 
      ? MOCK_INSTITUTIONS.find(inst => inst.id === institutionId) || MOCK_INSTITUTIONS[0]
      : MOCK_INSTITUTIONS[0];
    
    return `demo_access_token_${selectedInstitution.id}_${Date.now()}`;
  }

  async getDemoAccounts(accessToken: string): Promise<PlaidAccount[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extract institution ID from access token
    const tokenParts = accessToken.split('_');
    const institutionId = tokenParts.length >= 4 ? tokenParts.slice(3, -1).join('_') : 'ins_demo_chase';
    
    const institution = MOCK_INSTITUTIONS.find(inst => inst.id === institutionId) || MOCK_INSTITUTIONS[0];
    return institution.accounts;
  }

  async getDemoTransactions(
    accessToken: string,
    accountIds: string[],
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Extract institution ID from access token
    const tokenParts = accessToken.split('_');
    const institutionId = tokenParts.length >= 4 ? tokenParts.slice(3, -1).join('_') : 'ins_demo_chase';
    
    const institution = MOCK_INSTITUTIONS.find(inst => inst.id === institutionId) || MOCK_INSTITUTIONS[0];
    
    // Filter transactions by account IDs and date range
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    return institution.transactions.filter(tx => {
      const txTime = new Date(tx.date).getTime();
      return accountIds.includes(tx.account_id) && txTime >= startTime && txTime <= endTime;
    });
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

  // Combined methods that handle both real and demo modes
  async createLinkTokenOrDemo(userId: string): Promise<string | 'DEMO_MODE'> {
    if (this.isConfigured) {
      return this.createLinkToken(userId);
    } else {
      return 'DEMO_MODE';
    }
  }

  async exchangePublicTokenOrDemo(publicToken: string, institutionId?: string): Promise<string> {
    if (this.isConfigured && publicToken !== 'DEMO_MODE') {
      return this.exchangePublicToken(publicToken);
    } else {
      return this.exchangeDemoPublicToken(publicToken, institutionId);
    }
  }

  async getAccountsOrDemo(accessToken: string): Promise<PlaidAccount[]> {
    if (this.isConfigured && !accessToken.startsWith('demo_')) {
      return this.getAccounts(accessToken);
    } else {
      return this.getDemoAccounts(accessToken);
    }
  }

  async getTransactionsOrDemo(
    accessToken: string,
    accountIds: string[],
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (this.isConfigured && !accessToken.startsWith('demo_')) {
      return this.getTransactions(accessToken, accountIds, startDate, endDate);
    } else {
      return this.getDemoTransactions(accessToken, accountIds, startDate, endDate);
    }
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

  getMockInstitutions(): MockBankInstitution[] {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.getMockInstitutions();
  },

  async createDemoLinkFlow(): Promise<PlaidLinkResult> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.createDemoLinkFlow();
  },

  async createLinkTokenOrDemo(userId: string): Promise<string | 'DEMO_MODE'> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.createLinkTokenOrDemo(userId);
  },

  async exchangePublicTokenOrDemo(publicToken: string, institutionId?: string): Promise<string> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.exchangePublicTokenOrDemo(publicToken, institutionId);
  },

  async getAccountsOrDemo(accessToken: string): Promise<PlaidAccount[]> {
    if (!_plaidService) {
      _plaidService = new PlaidService();
    }
    return _plaidService.getAccountsOrDemo(accessToken);
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
    return _plaidService.getTransactionsOrDemo(accessToken, accountIds, startDate, endDate);
  },

  // Legacy methods for backward compatibility
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