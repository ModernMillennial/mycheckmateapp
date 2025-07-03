import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface HelpStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: string[];
  tips?: string[];
}

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ visible, onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const helpGuides: HelpStep[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Set up your account and connect your bank',
      icon: 'play-circle',
      steps: [
        'Open the Checkmate app for the first time',
        'Choose "Connect Your Bank" for automatic transaction import',
        'Or select "Enter Manually" to track transactions by hand',
        'If connecting bank: follow the secure bank connection process',
        'Your account will be set up with your current balance',
        'Start tracking your transactions!'
      ],
      tips: [
        'Bank connection is secure and read-only',
        'You can always switch between manual and automatic modes',
        'Starting balance is automatically imported from your bank'
      ]
    },
    {
      id: 'adding-transactions',
      title: 'Adding Transactions',
      description: 'Learn how to manually add income and expenses',
      icon: 'add-circle',
      steps: [
        'Tap the blue "+" button in the bottom right corner',
        'Or go to Menu → Quick Actions → Add Transaction',
        'Enter the transaction details:',
        '  • Payee: Who you paid or who paid you',
        '  • Amount: Enter positive for income, negative for expenses',
        '  • Date: When the transaction occurred',
        '  • Notes: Optional description or details',
        'Tap "Save Transaction" to add it to your register',
        'The transaction will appear as "NOT POSTED" until it clears your bank'
      ],
      tips: [
        'Use negative amounts for expenses (money going out)',
        'Use positive amounts for income (money coming in)',
        'Add notes for better transaction tracking',
        'Manual transactions can be converted to bank transactions later'
      ]
    },
    {
      id: 'syncing-bank',
      title: 'Bank Synchronization',
      description: 'Keep your register in sync with your bank account',
      icon: 'sync',
      steps: [
        'Connect your bank account if you haven\'t already',
        'Tap the sync icon in the top right corner',
        'Or go to Menu → Connect Bank → Sync Transactions',
        'Checkmate will download recent transactions from your bank',
        'Manual transactions that match bank transactions will be converted',
        'Status changes from "NOT POSTED" to "POSTED" for matched transactions',
        'New bank transactions are automatically added'
      ],
      tips: [
        'Sync regularly to keep your register current',
        'Matching is done by amount and approximate date',
        'Converted transactions maintain your original notes',
        'Bank sync is secure and encrypted'
      ]
    },
    {
      id: 'understanding-status',
      title: 'Transaction Status',
      description: 'Learn what NOT POSTED and POSTED mean',
      icon: 'information-circle',
      steps: [
        'Look at the status badge on each transaction',
        '"NOT POSTED" means:',
        '  • Transaction was entered manually',
        '  • Not yet confirmed by your bank',
        '  • May still be pending or processing',
        '"POSTED" means:',
        '  • Transaction has cleared your bank',
        '  • Amount has been deducted/added to your account',
        '  • This is your official bank record',
        'Manual transactions become POSTED when bank sync finds a match'
      ],
      tips: [
        'NOT POSTED transactions may take 1-3 business days to post',
        'Large transactions may take longer to clear',
        'Weekends and holidays can delay posting',
        'Your running balance includes all transactions regardless of status'
      ]
    },
    {
      id: 'reading-register',
      title: 'Reading Your Register',
      description: 'Understand the transaction display and balance calculation',
      icon: 'list',
      steps: [
        'Each transaction shows: Date, Type, Amount, and Running Balance',
        'Transaction type indicators:',
        '  • Receipt icon = Manual transaction',
        '  • Card icon = Bank transaction',
        'Amount column shows:',
        '  • Green (+) for money coming in (income)',
        '  • Red (-) for money going out (expenses)',
        'Balance column shows your account balance after each transaction',
        'Transactions are sorted with newest at the top',
        'Starting balance entry shows your account\'s starting point'
      ],
      tips: [
        'Running balance helps you see your account progression',
        'Tap any transaction to edit its details',
        'Starting balance cannot be edited (it\'s your actual bank balance)',
        'Use the balance to reconcile with your bank statements'
      ]
    },
    {
      id: 'budget-tracking',
      title: 'Budget Management',
      description: 'Track spending categories and set budgets',
      icon: 'pie-chart',
      steps: [
        'Go to Menu → Budget Tracker',
        'View your spending by category',
        'See income vs expenses breakdown',
        'Set budget limits for different categories',
        'Track your progress against budget goals',
        'Get insights on your spending patterns',
        'Use the visual charts to understand your finances'
      ],
      tips: [
        'Categories are automatically assigned based on transaction data',
        'You can manually change transaction categories',
        'Budget tracking helps identify overspending',
        'Review your budget monthly for best results'
      ]
    },
    {
      id: 'editing-transactions',
      title: 'Editing Transactions',
      description: 'Modify transaction details and fix errors',
      icon: 'create',
      steps: [
        'Tap on any transaction in your register',
        'This opens the transaction edit screen',
        'Modify any field: payee, amount, date, or notes',
        'For bank transactions, you can add/edit notes only',
        'Tap "Save Changes" to update the transaction',
        'The register will update with your changes',
        'Running balances will recalculate automatically'
      ],
      tips: [
        'You cannot edit the core details of bank transactions',
        'Always double-check amounts when editing',
        'Use notes to add context to transactions',
        'Starting balance transactions cannot be edited'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and how to resolve them',
      icon: 'help-buoy',
      steps: [
        'If transactions aren\'t syncing:',
        '  • Check your internet connection',
        '  • Try tapping the sync button again',
        '  • Ensure bank connection is still active',
        'If balances seem wrong:',
        '  • Check for duplicate transactions',
        '  • Verify all amounts are correct',
        '  • Compare with your bank statement',
        'If app is acting strange:',
        '  • Close and reopen the app',
        '  • Check for app updates',
        '  • Use Menu → Report Bug to contact support'
      ],
      tips: [
        'Most sync issues resolve themselves within a few minutes',
        'Keep your app updated for the best experience',
        'Contact support if issues persist',
        'Screenshots help when reporting bugs'
      ]
    }
  ];

  const renderStepsList = (steps: string[]) => {
    return steps.map((step, index) => {
      const isSubStep = step.startsWith('  •');
      const isNested = step.startsWith('    •');
      
      return (
        <View key={index} style={{ 
          flexDirection: 'row', 
          marginBottom: 8,
          marginLeft: isNested ? 32 : isSubStep ? 16 : 0 
        }}>
          <View style={{ 
            width: 20, 
            height: 20, 
            borderRadius: 10, 
            backgroundColor: isSubStep || isNested ? '#E5E7EB' : '#3B82F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            marginTop: 2
          }}>
            <Text style={{ 
              color: isSubStep || isNested ? '#6B7280' : 'white', 
              fontSize: 12, 
              fontWeight: 'bold' 
            }}>
              {isSubStep || isNested ? '•' : (index + 1).toString()}
            </Text>
          </View>
          <Text style={{ 
            flex: 1, 
            fontSize: 16, 
            color: '#374151',
            lineHeight: 24,
            marginTop: 1
          }}>
            {step.replace(/^(\s*)•\s*/, '')}
          </Text>
        </View>
      );
    });
  };

  const renderTips = (tips: string[]) => {
    return (
      <View style={{ 
        backgroundColor: '#FEF3C7', 
        padding: 16, 
        borderRadius: 12, 
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FDE68A'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="bulb-outline" size={20} color="#D97706" />
          <Text style={{ 
            marginLeft: 8, 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#92400E' 
          }}>
            Pro Tips
          </Text>
        </View>
        {tips.map((tip, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 6 }}>
            <Text style={{ color: '#D97706', marginRight: 8, marginTop: 2 }}>•</Text>
            <Text style={{ 
              flex: 1, 
              fontSize: 14, 
              color: '#92400E',
              lineHeight: 20
            }}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (!selectedGuide) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {/* Header */}
          <View style={{ 
            backgroundColor: '#3B82F6', 
            paddingHorizontal: 16, 
            paddingTop: 48, 
            paddingBottom: 20 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                Help Guide
              </Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </View>
            <Text style={{ color: '#BFDBFE', fontSize: 16, marginTop: 8 }}>
              Learn how to use Checkmate effectively
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: 16 
            }}>
              Choose a topic to get step-by-step instructions:
            </Text>

            {helpGuides.map((guide) => (
              <Pressable
                key={guide.id}
                onPress={() => setSelectedGuide(guide.id)}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    width: 48, 
                    height: 48, 
                    backgroundColor: '#EFF6FF', 
                    borderRadius: 24, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Ionicons name={guide.icon as any} size={24} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: 4
                    }}>
                      {guide.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#6B7280',
                      lineHeight: 20
                    }}>
                      {guide.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </Pressable>
            ))}

            {/* Quick Help Section */}
            <View style={{ 
              backgroundColor: '#F3F4F6', 
              borderRadius: 12, 
              padding: 16, 
              marginTop: 8,
              marginBottom: 32
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="flash" size={20} color="#3B82F6" />
                <Text style={{ 
                  marginLeft: 8, 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: '#374151' 
                }}>
                  Quick Help
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20 }}>
                Need immediate assistance? Use the "Report Bug" option in the menu to contact our support team with detailed diagnostic information.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  const currentGuide = helpGuides.find(guide => guide.id === selectedGuide);
  
  if (!currentGuide) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{ 
          backgroundColor: '#3B82F6', 
          paddingHorizontal: 16, 
          paddingTop: 48, 
          paddingBottom: 20 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable 
              onPress={() => setSelectedGuide(null)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 16, marginLeft: 4 }}>Back</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <View style={{ 
              width: 40, 
              height: 40, 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: 20, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name={currentGuide.icon as any} size={20} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
                {currentGuide.title}
              </Text>
              <Text style={{ color: '#BFDBFE', fontSize: 14, marginTop: 2 }}>
                {currentGuide.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: 20 
          }}>
            Step-by-Step Instructions
          </Text>

          {renderStepsList(currentGuide.steps)}

          {currentGuide.tips && renderTips(currentGuide.tips)}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default HelpGuideModal;