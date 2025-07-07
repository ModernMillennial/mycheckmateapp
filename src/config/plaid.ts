import { PlaidEnvironment } from 'react-native-plaid-link-sdk';

export interface PlaidConfig {
  clientId: string;
  secret: string;
  environment: PlaidEnvironment;
  publicKey?: string;
  countryCodes: string[];
  products: string[];
}

// Environment configuration
const ENV = process.env.EXPO_PUBLIC_PLAID_ENVIRONMENT || 'sandbox';

export const PLAID_CONFIG: PlaidConfig = {
  clientId: process.env.EXPO_PUBLIC_PLAID_CLIENT_ID || 'your_client_id',
  secret: process.env.EXPO_PUBLIC_PLAID_SECRET || 'your_secret_key',
  environment: ENV === 'production' ? PlaidEnvironment.PRODUCTION : PlaidEnvironment.SANDBOX,
  publicKey: process.env.EXPO_PUBLIC_PLAID_PUBLIC_KEY,
  countryCodes: ['US', 'CA'],
  products: ['transactions', 'auth', 'identity', 'assets', 'investments']
};

// Plaid API base URL
export const PLAID_API_URL = ENV === 'production' 
  ? 'https://production.plaid.com'
  : 'https://sandbox.plaid.com';

// Test credentials for sandbox
export const SANDBOX_TEST_CREDENTIALS = {
  username: 'user_good',
  password: 'pass_good',
  institution: 'ins_109508' // Chase Bank
};

// Production mode check
export const isProduction = ENV === 'production';

// Common Plaid products
export const PLAID_PRODUCTS = {
  TRANSACTIONS: 'transactions',
  AUTH: 'auth',
  IDENTITY: 'identity',
  ASSETS: 'assets',
  INVESTMENTS: 'investments',
  LIABILITIES: 'liabilities'
} as const;

// Plaid country codes
export const PLAID_COUNTRY_CODES = {
  US: 'US',
  CA: 'CA',
  GB: 'GB',
  FR: 'FR',
  ES: 'ES',
  NL: 'NL',
  DE: 'DE',
  IT: 'IT',
  PL: 'PL',
  DK: 'DK',
  NO: 'NO',
  SE: 'SE',
  EE: 'EE',
  LT: 'LT',
  LV: 'LV'
} as const;

// Webhook URLs (configure these based on your backend)
export const WEBHOOK_URL = ENV === 'production'
  ? 'https://yourapp.com/api/plaid/webhook'
  : 'https://yourapp-dev.com/api/plaid/webhook';