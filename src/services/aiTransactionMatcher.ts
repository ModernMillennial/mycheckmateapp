import { Transaction } from '../types';
import { getOpenAITextResponse } from '../api/chat-service';

export interface TransactionMatch {
  manualTransaction: Transaction;
  bankTransaction: Transaction;
  confidence: number;
  reasoning: string;
}

export interface AIMatchSuggestion {
  matches: TransactionMatch[];
  unmatchedManual: Transaction[];
  unmatchedBank: Transaction[];
}

export class AITransactionMatcher {
  
  /**
   * Use AI to intelligently match manual transactions with bank transactions
   */
  static async findMatches(
    manualTransactions: Transaction[],
    bankTransactions: Transaction[]
  ): Promise<AIMatchSuggestion> {
    try {
      const prompt = this.buildMatchingPrompt(manualTransactions, bankTransactions);
      
      const response = await getOpenAITextResponse([
        {
          role: "system",
          content: "You are an expert financial transaction matching system. Analyze manual entries and bank transactions to find intelligent matches, even when details don't exactly align. Consider variations in payee names, slight date differences, and amount discrepancies due to pending charges or tips."
        },
        {
          role: "user", 
          content: prompt
        }
      ], {
        temperature: 0.1, // Low temperature for consistent matching
        maxTokens: 2048
      });

      return this.parseAIResponse(response.content, manualTransactions, bankTransactions);
      
    } catch (error) {
      console.error('AI matching failed:', error);
      // Fallback to simple rule-based matching
      return this.fallbackMatching(manualTransactions, bankTransactions);
    }
  }

  /**
   * Find potential matches for a single manual transaction
   */
  static async findMatchesForTransaction(
    manualTransaction: Transaction,
    bankTransactions: Transaction[]
  ): Promise<TransactionMatch[]> {
    try {
      const prompt = `
Analyze this manual transaction and find the best matches from the bank transactions:

MANUAL TRANSACTION:
Date: ${manualTransaction.date}
Payee: ${manualTransaction.payee}
Amount: $${manualTransaction.amount}
Notes: ${manualTransaction.notes || 'None'}

BANK TRANSACTIONS:
${bankTransactions.map((t, i) => `${i + 1}. Date: ${t.date}, Payee: ${t.payee}, Amount: $${t.amount}`).join('\n')}

Return matches in this JSON format:
{
  "matches": [
    {
      "bankTransactionIndex": 0,
      "confidence": 95,
      "reasoning": "Exact amount match, payee variation (McDonald's vs MCD), same date"
    }
  ]
}

Consider:
- Payee name variations (abbreviations, different formats)
- Date differences within 3 days
- Amount differences under $5 (tips, fees, pending charges)
- Common merchant name patterns
`;

      const response = await getOpenAITextResponse([
        { role: "user", content: prompt }
      ], { temperature: 0.1 });

      const parsed = JSON.parse(response.content);
      
      return parsed.matches.map((match: any) => ({
        manualTransaction,
        bankTransaction: bankTransactions[match.bankTransactionIndex],
        confidence: match.confidence,
        reasoning: match.reasoning
      }));

    } catch (error) {
      console.error('AI single match failed:', error);
      return [];
    }
  }

  private static buildMatchingPrompt(
    manualTransactions: Transaction[],
    bankTransactions: Transaction[]
  ): string {
    return `
Analyze these manual transactions and bank transactions to find intelligent matches:

MANUAL TRANSACTIONS:
${manualTransactions.map((t, i) => `${i + 1}. Date: ${t.date}, Payee: ${t.payee}, Amount: $${t.amount}, Notes: ${t.notes || 'None'}`).join('\n')}

BANK TRANSACTIONS:
${bankTransactions.map((t, i) => `${i + 1}. Date: ${t.date}, Payee: ${t.payee}, Amount: $${t.amount}`).join('\n')}

Find matches considering:
- Payee name variations (McDonald's = MCD, Starbucks = SBX, etc.)
- Date differences within 3 days
- Amount differences under $5 (for tips, fees, pending charges)
- Common patterns in merchant names

Return matches in this JSON format:
{
  "matches": [
    {
      "manualIndex": 0,
      "bankIndex": 0,
      "confidence": 95,
      "reasoning": "Exact amount match, payee variation"
    }
  ]
}

Only suggest matches with confidence > 70%.
`;
  }

  private static parseAIResponse(
    response: string,
    manualTransactions: Transaction[],
    bankTransactions: Transaction[]
  ): AIMatchSuggestion {
    try {
      const parsed = JSON.parse(response);
      const matches: TransactionMatch[] = [];
      const usedManualIds = new Set<string>();
      const usedBankIds = new Set<string>();

      parsed.matches?.forEach((match: any) => {
        const manual = manualTransactions[match.manualIndex];
        const bank = bankTransactions[match.bankIndex];
        
        if (manual && bank && !usedManualIds.has(manual.id) && !usedBankIds.has(bank.id)) {
          matches.push({
            manualTransaction: manual,
            bankTransaction: bank,
            confidence: match.confidence,
            reasoning: match.reasoning
          });
          usedManualIds.add(manual.id);
          usedBankIds.add(bank.id);
        }
      });

      const unmatchedManual = manualTransactions.filter(t => !usedManualIds.has(t.id));
      const unmatchedBank = bankTransactions.filter(t => !usedBankIds.has(t.id));

      return { matches, unmatchedManual, unmatchedBank };
      
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.fallbackMatching(manualTransactions, bankTransactions);
    }
  }

  private static fallbackMatching(
    manualTransactions: Transaction[],
    bankTransactions: Transaction[]
  ): AIMatchSuggestion {
    const matches: TransactionMatch[] = [];
    const usedBankIds = new Set<string>();

    manualTransactions.forEach(manual => {
      const match = bankTransactions.find(bank => 
        !usedBankIds.has(bank.id) &&
        Math.abs(manual.amount - bank.amount) < 0.01 &&
        Math.abs(new Date(manual.date).getTime() - new Date(bank.date).getTime()) <= 86400000 * 3
      );

      if (match) {
        matches.push({
          manualTransaction: manual,
          bankTransaction: match,
          confidence: 80,
          reasoning: 'Rule-based exact amount and date match'
        });
        usedBankIds.add(match.id);
      }
    });

    const usedManualIds = new Set(matches.map(m => m.manualTransaction.id));
    const unmatchedManual = manualTransactions.filter(t => !usedManualIds.has(t.id));
    const unmatchedBank = bankTransactions.filter(t => !usedBankIds.has(t.id));

    return { matches, unmatchedManual, unmatchedBank };
  }

  /**
   * Smart payee suggestion for manual entry
   */
  static async suggestPayeeCorrection(
    enteredPayee: string,
    recentBankTransactions: Transaction[]
  ): Promise<string[]> {
    if (!enteredPayee || recentBankTransactions.length === 0) return [];

    try {
      const recentPayees = [...new Set(recentBankTransactions.map(t => t.payee))];
      
      const prompt = `
The user entered payee: "${enteredPayee}"

Recent bank transaction payees:
${recentPayees.slice(0, 20).map((p, i) => `${i + 1}. ${p}`).join('\n')}

Suggest the 3 most likely intended payees from the bank transactions that match "${enteredPayee}".
Consider abbreviations, common misspellings, and merchant variations.

Return only a JSON array of suggestions:
["Suggested Payee 1", "Suggested Payee 2", "Suggested Payee 3"]
`;

      const response = await getOpenAITextResponse([
        { role: "user", content: prompt }
      ], { temperature: 0.1 });

      const suggestions = JSON.parse(response.content);
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
      
    } catch (error) {
      console.error('Payee suggestion failed:', error);
      return [];
    }
  }
}