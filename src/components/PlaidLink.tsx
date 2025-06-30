import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LinkSuccess, 
  LinkExit,
  PlaidLinkProps,
  usePlaidEmitter
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
      
      // Check if Plaid is configured
      if (!plaidService.isPlaidConfigured()) {
        // Show demo mode alert
        Alert.alert(
          'Demo Mode',
          'Plaid integration is not configured. The app will use mock data for demonstration purposes.',
          [
            {
              text: 'Continue with Demo',
              onPress: () => {
                // Simulate successful connection with mock data
                const mockResult: PlaidLinkResult = {
                  publicToken: 'demo_public_token',
                  metadata: {
                    institution: {
                      name: 'Demo Bank',
                      institution_id: 'demo_bank',
                    },
                    accounts: [
                      {
                        account_id: 'demo_account_1',
                        name: 'Demo Checking',
                        official_name: 'Demo Checking Account',
                        type: 'depository',
                        subtype: 'checking',
                        balances: {
                          available: 1250.75,
                          current: 1250.75,
                          limit: null,
                        },
                        mask: '1234',
                      },
                    ],
                  },
                };
                onSuccess(mockResult);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }
      
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
      const result: PlaidLinkResult = {
        publicToken: success.publicToken,
        metadata: {
          institution: {
            name: (success.metadata.institution as any)?.name || 'Unknown Bank',
            institution_id: (success.metadata.institution as any)?.institution_id || 'unknown',
          },
          accounts: (success.metadata.accounts || []).map((account: any) => ({
            account_id: account.id || account.account_id,
            name: account.name || 'Account',
            official_name: account.official_name,
            type: account.type,
            subtype: account.subtype,
            balances: {
              available: account.balances?.available || null,
              current: account.balances?.current || null,
              limit: account.balances?.limit || null,
            },
            mask: account.mask || '',
          })),
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

  // For now, use manual opening approach
  usePlaidEmitter((event: any) => {
    if (event.eventName === 'onSuccess') {
      handleSuccess(event.data);
    } else if (event.eventName === 'onExit') {
      handleExit(event.data);
    }
  });

  const handlePress = () => {
    // For demo purposes, trigger the mock flow
    if (!plaidService.isPlaidConfigured()) {
      initializePlaidLink();
    } else {
      // In a real implementation, you would trigger the Plaid Link flow here
      console.log('Plaid Link would open here with token:', linkToken);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
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
};

export default PlaidLink;