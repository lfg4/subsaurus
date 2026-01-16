import type {
  CurrencyTotal,
  SubscriptionHealth,
  SubscriptionWithoutUsers,
  UpcomingRenewal,
  ProjectExpense,
} from './types';

export class DashboardStats {
  private constructor(
    public readonly currencyTotals: CurrencyTotal[],
    public readonly subscriptionHealth: SubscriptionHealth[],
    public readonly subscriptionsWithoutUsers: SubscriptionWithoutUsers[],
    public readonly upcomingRenewals: UpcomingRenewal[],
    public readonly projectExpenses: ProjectExpense[],
    public readonly convertedTotal: number,
    public readonly preferredCurrency: string
  ) {}

  static create(
    currencyTotals: CurrencyTotal[],
    subscriptionHealth: SubscriptionHealth[],
    subscriptionsWithoutUsers: SubscriptionWithoutUsers[],
    upcomingRenewals: UpcomingRenewal[],
    projectExpenses: ProjectExpense[],
    convertedTotal: number,
    preferredCurrency: string
  ): DashboardStats {
    return new DashboardStats(
      currencyTotals,
      subscriptionHealth,
      subscriptionsWithoutUsers,
      upcomingRenewals,
      projectExpenses,
      convertedTotal,
      preferredCurrency
    );
  }

  toPrimitives() {
  return {
    currencyTotals: this.currencyTotals,
    subscriptionHealth: this.subscriptionHealth,
    subscriptionsWithoutUsers: this.subscriptionsWithoutUsers,
    upcomingRenewals: this.upcomingRenewals.map(r => ({
      id: r.id,
      name: r.name,
      amount: r.amount,
      currency: r.currency,
      renewalDate: r.renewalDate instanceof Date ? r.renewalDate.toISOString() : r.renewalDate,
      daysUntil: r.daysUntil,
    })),
    projectExpenses: this.projectExpenses,
    convertedTotal: this.convertedTotal,
    preferredCurrency: this.preferredCurrency,
  };
}
}