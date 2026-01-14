import { SubscriptionPattern } from '../domain/SubscriptionPattern';
import { Transaction } from '../domain/Transaction';


export class DetectSubscriptionsService {
 
  async detectPatterns(transactions: Transaction[]): Promise<SubscriptionPattern[]> {
    const expenses = transactions.filter(t => t.isExpense());

    if (expenses.length === 0) {
      return [];
    }

    const patterns = SubscriptionPattern.detectPatterns(expenses);

    return patterns;
  }

  filterLikelySubscriptions(patterns: SubscriptionPattern[]): SubscriptionPattern[] {
    return patterns.filter(pattern => {
      if (pattern.confidence < 50) {
        return false;
      }

      if (pattern.transactions.length < 2) {
        return false;
      }

      if (!pattern.suggestedCycle) {
        return false;
      }

      return true;
    });
  }

  groupSimilarPatterns(patterns: SubscriptionPattern[]): SubscriptionPattern[] {
    return patterns;
  }
}

