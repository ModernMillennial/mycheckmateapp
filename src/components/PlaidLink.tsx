import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  LinkSuccess, 
  LinkExit,
  PlaidLink as PlaidLinkSDK,
  usePlaidEmitter
} from 'react-native-plaid-link-sdk';
import { plaidService, PlaidLinkResult } from '../services/plaidService';
import { usePlaidStore } from '../state/plaidStore';
import { plaidAPI } from '../api/plaid';
import { PLAID_CONFIG } from '../config/plaid';

interface Props {
  userId: string;
  onSuccess?: (result: PlaidLinkResult) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary';
  products?: string[];
  environment?: 'sandbox' | 'production';
  autoLink?: boolean;
}

const PlaidLink: React.FC<Props> = ({ 
  userId, 
  onSuccess, 
  onError, 
  buttonText = 'Connect Bank Account',
  buttonStyle = 'primary',
  products = PLAID_CONFIG.products,
  environment = 'sandbox',
  autoLink = false
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { 
    linkAccount, 
    isLinkingAccount, 
    error: storeError, 
    setError, 
    clearError 
  } = usePlaidStore();

  useEffect(() => {
    initializePlaidLink();
  }, []);

  const initializePlaidLink = async () => {
    try {
      setLoading(true);
      
      // Check if Plaid is configured
      if (!plaidService.isPlaidConfigured()) {
        Alert.alert(
          'Configuration Required',
          'Plaid integration is not configured. Please set up your Plaid credentials in the environment variables.',
          [
            {
              text: 'OK',
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
      const { publicToken, metadata } = success;
      const institutionName = (metadata.institution as any)?.name || 'Unknown Bank';
      
      // Use the store to link the account
      if (autoLink) {
        await linkAccount(publicToken, institutionName);
      }
      
      const result: PlaidLinkResult = {
        publicToken,
        metadata: {
          institution: {
            name: institutionName,
            institution_id: (metadata.institution as any)?.institution_id || 'unknown',
          },
          accounts: (metadata.accounts || []).map((account: any) => ({
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
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        Alert.alert('Success', `Successfully connected ${institutionName}`);
      }
    } catch (error) {
      console.error('Error processing Plaid success:', error);
      setError(error instanceof Error ? error.message : 'Failed to link account');
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
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
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
    if (!plaidService.isPlaidConfigured()) {
      initializePlaidLink();
    } else {
      // Trigger the Plaid Link flow here
      // Note: You'll need to implement the actual Plaid Link SDK integration
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
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
      }}
    >
      {renderContent()}
    </Pressable>
  );
};

export default PlaidLink;