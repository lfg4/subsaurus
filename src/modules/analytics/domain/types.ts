export interface CurrencyTotal {
  currency: string;
  totalMonthly: number;
  subscriptionCount: number;
}

export interface SubscriptionHealth {
  id: number;
  name: string;
  monthlyEquivalent: number;
  currency: string;
  status: 'ready-to-cancel' | 'low-usage';
  reason: string;
  yesCount: number;
  noCount: number;
  littleCount: number;
  noResponseCount: number;
}

export interface SubscriptionWithoutUsers {
  id: number;
  name: string;
  monthlyEquivalent: number;
  currency: string;
}

export interface UpcomingRenewal {
  id: number;
  name: string;
  amount: number;
  currency: string;
  renewalDate: Date | string;  // ← Cambia esta línea
  daysUntil: number;
}

export interface ProjectExpense {
  project: string;
  currency: string;
  monthlyAmount: number;
  subscriptionCount: number;
}