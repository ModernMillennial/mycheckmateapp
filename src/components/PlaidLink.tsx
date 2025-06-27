import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PlaidLink as PlaidLinkSDK, 
  LinkSuccess, 
  LinkExit,
  PlaidLinkProps
} from 'react-native-plaid-link-sdk';
import { plaidService, PlaidLinkResult } from '../services/plaidService';

interface Props {
  userId: string;
  onSuccess: (result: PlaidLinkResult) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary';
}

const PlaidLink: React.FC<Props> = ({ 
  userId, 
  onSuccess, 
  onError, 
  buttonText = 'Connect Bank Account',
  buttonStyle = 'primary'
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializePlaidLink();
  }, []);

  const initializePlaidLink = async () => {
    try {
      setLoading(true);
      const token = await plaidService.createLinkToken(userId);
      setLinkToken(token);
    } catch (error) {
      console.error('Failed to initialize Plaid Link:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (success: LinkSuccess) => {
    try {
      // Mock successful link result when using demo mode
      if (linkToken === 'link-sandbox-mock-token') {
        const mockResult: PlaidLinkResult = {
          publicToken: 'public-sandbox-mock-token',
          metadata: {
            institution: {
              name: 'Demo Bank',
              institution_id: 'demo_bank_001',
            },
            accounts: [
              {
                account_id: 'demo_checking_001',
                name: 'Demo Checking',
                official_name: 'Demo Bank Checking Account',
                type: 'depository',
                subtype: 'checking',
                balances: {
                  available: 1250.75,
                  current: 1250.75,
                  limit: null,
                },
                mask: '1234',
              },
              {
                account_id: 'demo_savings_001',
                name: 'Demo Savings',
                official_name: 'Demo Bank Savings Account',
                type: 'depository',
                subtype: 'savings',
                balances: {
                  available: 8750.25,
                  current: 8750.25,
                  limit: null,
                },
                mask: '5678',
              },
            ],
          },
        };
        onSuccess(mockResult);
        return;
      }

      // Real Plaid flow
      const result: PlaidLinkResult = {
        publicToken: success.publicToken,
        metadata: {
          institution: success.metadata.institution,
          accounts: success.metadata.accounts,
        },
      };
      onSuccess(result);
    } catch (error) {
      console.error('Error processing Plaid success:', error);
      onError?.(error);
    }
  };

  const handleExit = (exit: LinkExit) => {
    if (exit.error) {
      console.error('Plaid Link exit error:', exit.error);
      onError?.(exit.error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={buttonStyle === 'primary' ? 'white' : '#3B82F6'} size="small" />
          <Text style={{ 
            marginLeft: 8, 
            color: buttonStyle === 'primary' ? 'white' : '#3B82F6',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Initializing...
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons 
          name="link" 
          size={20} 
          color={buttonStyle === 'primary' ? 'white' : '#3B82F6'} 
        />
        <Text style={{ 
          marginLeft: 8, 
          color: buttonStyle === 'primary' ? 'white' : '#3B82F6',
          fontSize: 16,
          fontWeight: '600'
        }}>
          {buttonText}
        </Text>
      </View>
    );
  };

  if (!linkToken) {
    return (
      <Pressable
        onPress={initializePlaidLink}
        disabled={loading}
        style={{
          backgroundColor: buttonStyle === 'primary' ? '#3B82F6' : 'white',
          borderWidth: buttonStyle === 'secondary' ? 2 : 0,
          borderColor: buttonStyle === 'secondary' ? '#3B82F6' : 'transparent',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {renderContent()}
      </Pressable>
    );
  }

  // For demo mode (when using mock token), show a simple button
  if (linkToken === 'link-sandbox-mock-token') {
    return (
      <Pressable
        onPress={() => {
          // Simulate Plaid Link flow
          setTimeout(() => {
            handleSuccess({
              publicToken: 'public-sandbox-mock-token',
              metadata: {
                institution: {
                  name: 'Demo Bank',
                  institution_id: 'demo_bank_001',
                },
                accounts: [
                  {
                    id: 'demo_checking_001',
                    name: 'Demo Checking',
                    official_name: 'Demo Bank Checking Account',
                    type: 'depository',
                    subtype: 'checking',
                    mask: '1234',
                  },
                ],
              },
            } as LinkSuccess);
          }, 1000);
        }}
        style={{
          backgroundColor: buttonStyle === 'primary' ? '#3B82F6' : 'white',
          borderWidth: buttonStyle === 'secondary' ? 2 : 0,
          borderColor: buttonStyle === 'secondary' ? '#3B82F6' : 'transparent',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
        }}
      >
        {renderContent()}
      </Pressable>
    );
  }

  // Real Plaid Link component
  return (
    <PlaidLinkSDK
      tokenConfig={{
        token: linkToken,
      }}
      onSuccess={handleSuccess}
      onExit={handleExit}
    >
      <Pressable
        style={{
          backgroundColor: buttonStyle === 'primary' ? '#3B82F6' : 'white',
          borderWidth: buttonStyle === 'secondary' ? 2 : 0,
          borderColor: buttonStyle === 'secondary' ? '#3B82F6' : 'transparent',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
        }}
      >
        {renderContent()}
      </Pressable>
    </PlaidLinkSDK>
  );
};

export default PlaidLink;