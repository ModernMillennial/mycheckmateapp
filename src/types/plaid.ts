// Re-export types from the API module for convenience
export type {
  PlaidAccount,
  PlaidTransaction,
  PlaidInstitution,
  PlaidLinkToken,
  PlaidPublicTokenExchange,
} from '../api/plaid';

export type {
  PlaidItem,
  PlaidState,
} from '../state/plaidStore';

export type {
  PlaidConfig,
} from '../config/plaid';

// Additional utility types
export interface PlaidEnvironmentConfig {
  clientId: string;
  secret: string;
  environment: 'sandbox' | 'development' | 'production';
}

export interface PlaidWebhookData {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: {
    error_type: string;
    error_code: string;
    error_message: string;
  };
}

export interface PlaidLinkMetadata {
  institution?: {
    name: string;
    institution_id: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
  }>;
  link_session_id: string;
}

export interface PlaidError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message?: string;
}