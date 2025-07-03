import { PLAID_CONFIG, PLAID_API_URL } from '../config/plaid';

// Types for Plaid API responses
export interface PlaidLinkToken {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidPublicTokenExchange {
  access_token: string;
  item_id: string;
  request_id: string;
}

export interface PlaidAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string;
    limit: number | null;
    unofficial_currency_code: string | null;
  };
  mask: string;
  name: string;
  official_name: string;
  persistent_account_id: string;
  subtype: string;
  type: string;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  unofficial_currency_code: string | null;
  category: string[];
  category_id: string;
  date: string;
  datetime: string | null;
  authorized_date: string | null;
  authorized_datetime: string | null;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    store_number: string | null;
  };
  name: string;
  merchant_name: string | null;
  payment_meta: {
    by_order_of: string | null;
    payee: string | null;
    payer: string | null;
    payment_method: string | null;
    payment_processor: string | null;
    ppd_id: string | null;
    reason: string | null;
    reference_number: string | null;
  };
  pending: boolean;
  pending_transaction_id: string | null;
  account_owner: string | null;
  transaction_code: string | null;
  transaction_type: string;
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  url: string | null;
  primary_color: string | null;
  logo: string | null;
  routing_numbers: string[];
  oauth: boolean;
  status: {
    item_logins: {
      status: string;
      last_status_change: string;
    };
    transactions_updates: {
      status: string;
      last_status_change: string;
    };
    auth: {
      status: string;
      last_status_change: string;
    };
    identity: {
      status: string;
      last_status_change: string;
    };
    investments_updates: {
      status: string;
      last_status_change: string;
    };
    liabilities_updates: {
      status: string;
      last_status_change: string;
    };
  };
}

class PlaidAPI {
  private baseURL: string;
  private clientId: string;
  private secret: string;

  constructor() {
    this.baseURL = PLAID_API_URL;
    this.clientId = PLAID_CONFIG.clientId;
    this.secret = PLAID_CONFIG.secret;
  }

  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        ...body,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_message || 'Plaid API request failed');
    }

    return response.json();
  }

  // Create a link token for Plaid Link
  async createLinkToken(userId: string, products: string[] = PLAID_CONFIG.products): Promise<PlaidLinkToken> {
    return this.makeRequest('/link/token/create', {
      user: {
        client_user_id: userId,
      },
      client_name: 'Your App Name',
      products,
      country_codes: PLAID_CONFIG.countryCodes,
      language: 'en',
      webhook: 'https://yourapp.com/api/plaid/webhook', // Configure your webhook URL
    });
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string): Promise<PlaidPublicTokenExchange> {
    return this.makeRequest('/link/token/exchange', {
      public_token: publicToken,
    });
  }

  // Get account information
  async getAccounts(accessToken: string): Promise<{ accounts: PlaidAccount[] }> {
    return this.makeRequest('/accounts/get', {
      access_token: accessToken,
    });
  }

  // Get account balances
  async getAccountBalances(accessToken: string): Promise<{ accounts: PlaidAccount[] }> {
    return this.makeRequest('/accounts/balance/get', {
      access_token: accessToken,
    });
  }

  // Get transactions
  async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    offset: number = 0,
    count: number = 100
  ): Promise<{ transactions: PlaidTransaction[]; total_transactions: number }> {
    return this.makeRequest('/transactions/get', {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      offset,
      count,
    });
  }

  // Get auth information (routing and account numbers)
  async getAuth(accessToken: string): Promise<{ accounts: PlaidAccount[]; numbers: any }> {
    return this.makeRequest('/auth/get', {
      access_token: accessToken,
    });
  }

  // Get identity information
  async getIdentity(accessToken: string): Promise<{ accounts: PlaidAccount[]; identity: any }> {
    return this.makeRequest('/identity/get', {
      access_token: accessToken,
    });
  }

  // Get institution information
  async getInstitution(institutionId: string): Promise<{ institution: PlaidInstitution }> {
    return this.makeRequest('/institutions/get_by_id', {
      institution_id: institutionId,
      country_codes: PLAID_CONFIG.countryCodes,
    });
  }

  // Search institutions
  async searchInstitutions(query: string): Promise<{ institutions: PlaidInstitution[] }> {
    return this.makeRequest('/institutions/search', {
      query,
      products: PLAID_CONFIG.products,
      country_codes: PLAID_CONFIG.countryCodes,
    });
  }

  // Remove (unlink) an item
  async removeItem(accessToken: string): Promise<{ removed: boolean }> {
    return this.makeRequest('/item/remove', {
      access_token: accessToken,
    });
  }

  // Get item information
  async getItem(accessToken: string): Promise<{ item: any }> {
    return this.makeRequest('/item/get', {
      access_token: accessToken,
    });
  }

  // Create a public token (for re-authentication)
  async createPublicToken(accessToken: string): Promise<{ public_token: string }> {
    return this.makeRequest('/link/token/create', {
      access_token: accessToken,
    });
  }

  // Update webhook URL
  async updateWebhook(accessToken: string, webhook: string): Promise<{ item: any }> {
    return this.makeRequest('/item/webhook/update', {
      access_token: accessToken,
      webhook,
    });
  }

  // Get liabilities
  async getLiabilities(accessToken: string): Promise<{ accounts: PlaidAccount[]; liabilities: any }> {
    return this.makeRequest('/liabilities/get', {
      access_token: accessToken,
    });
  }

  // Get investments
  async getInvestments(accessToken: string): Promise<{ accounts: PlaidAccount[]; holdings: any; securities: any }> {
    return this.makeRequest('/investments/holdings/get', {
      access_token: accessToken,
    });
  }

  // Get investment transactions
  async getInvestmentTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<{ investment_transactions: any[] }> {
    return this.makeRequest('/investments/transactions/get', {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });
  }

  // Refresh transactions (force update)
  async refreshTransactions(accessToken: string): Promise<{ request_id: string }> {
    return this.makeRequest('/transactions/refresh', {
      access_token: accessToken,
    });
  }

  // Get categories
  async getCategories(): Promise<{ categories: any[] }> {
    return this.makeRequest('/categories/get', {});
  }

  // Sandbox only - Reset login (for testing)
  async sandboxResetLogin(accessToken: string): Promise<{ reset_login: boolean }> {
    if (PLAID_CONFIG.environment.toString() !== 'sandbox') {
      throw new Error('This method is only available in sandbox environment');
    }
    return this.makeRequest('/sandbox/item/reset_login', {
      access_token: accessToken,
    });
  }

  // Sandbox only - Fire webhook
  async sandboxFireWebhook(accessToken: string, webhookCode: string): Promise<{ webhook_fired: boolean }> {
    if (PLAID_CONFIG.environment.toString() !== 'sandbox') {
      throw new Error('This method is only available in sandbox environment');
    }
    return this.makeRequest('/sandbox/item/fire_webhook', {
      access_token: accessToken,
      webhook_code: webhookCode,
    });
  }
}

export const plaidAPI = new PlaidAPI();
export default plaidAPI;