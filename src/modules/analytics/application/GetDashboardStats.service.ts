import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '@/src/modules/usage-tracking/infrastructure/UsageResponseRepository';
import { DashboardStats } from '../domain/DashboardStats';
import type { Subscription } from '@/src/modules/subscription/domain/Subscription';
import type {
  CurrencyTotal,
  SubscriptionHealth,
  SubscriptionWithoutUsers,
  UpcomingRenewal,
  ProjectExpense,
} from '../domain/types';
import { RenewalCycle, UsageResponseType } from '@/src/types/enums';

export class GetDashboardStatsService {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private usageCheckRepository: UsageCheckRepository,
    private usageResponseRepository: UsageResponseRepository
  ) {}

  async execute(workspaceId: string): Promise<DashboardStats> {
    const subscriptions = await this.subscriptionRepository.findAll(workspaceId);

    const currencyTotals = this.calculateCurrencyTotals(subscriptions);
    const subscriptionHealth = await this.analyzeSubscriptionHealth(subscriptions);
    const subscriptionsWithoutUsers = this.findSubscriptionsWithoutUsers(subscriptions);
    const upcomingRenewals = this.getUpcomingRenewals(subscriptions);
    const projectExpenses = this.calculateProjectExpenses(subscriptions);

    return DashboardStats.create(
      currencyTotals,
      subscriptionHealth,
      subscriptionsWithoutUsers,
      upcomingRenewals,
      projectExpenses
    );
  }

  private getMonthlyEquivalent(subscription: Subscription): number {
    const { amount } = subscription.cost.toPrimitives();
    const cycle = subscription.renewalCycle;

    switch (cycle) {
      case RenewalCycle.MONTHLY:
        return amount;
      case RenewalCycle.YEARLY:
        return amount / 12;
      case RenewalCycle.QUARTERLY:
        return amount / 3;
      case RenewalCycle.SEMESTRAL:
        return amount / 6;
      case RenewalCycle.CUSTOM:
        return amount;
      default:
        return amount;
    }
  }

  private calculateCurrencyTotals(subscriptions: Subscription[]): CurrencyTotal[] {
    const currencyMap = new Map<string, { monthly: number; count: number }>();

    subscriptions.forEach(sub => {
      const { currency } = sub.cost.toPrimitives();
      const monthlyEquiv = this.getMonthlyEquivalent(sub);

      const existing = currencyMap.get(currency) || { monthly: 0, count: 0 };
      currencyMap.set(currency, {
        monthly: existing.monthly + monthlyEquiv,
        count: existing.count + 1,
      });
    });

    return Array.from(currencyMap.entries()).map(([currency, data]) => ({
      currency,
      totalMonthly: Math.round(data.monthly * 100) / 100,
      subscriptionCount: data.count,
    }));
  }

  private async analyzeSubscriptionHealth(
    subscriptions: Subscription[]
  ): Promise<SubscriptionHealth[]> {
    const healthIssues: SubscriptionHealth[] = [];

    for (const sub of subscriptions) {
      const usageChecks = await this.usageCheckRepository.findBySubscriptionId(sub.id);
      
      const sentChecks = usageChecks.filter(uc => uc.status === 'SENT');
      if (sentChecks.length === 0) continue;

      const lastCheck = sentChecks[0];
      const responses = await this.usageResponseRepository.findByUsageCheck(lastCheck.id);

      const yesCount = responses.filter(r => r.response === UsageResponseType.YES).length;
      const noCount = responses.filter(r => r.response === UsageResponseType.NO).length;
      const littleCount = responses.filter(r => r.response === UsageResponseType.LITTLE).length;
      const noResponseCount = responses.filter(r => r.response === null).length;

      if (yesCount > 0) continue;

      const { currency } = sub.cost.toPrimitives();
      const monthlyEquiv = Math.round(this.getMonthlyEquivalent(sub) * 100) / 100;

      if (noCount > 0 && littleCount === 0) {
        healthIssues.push({
          id: sub.id,
          name: sub.name,
          monthlyEquivalent: monthlyEquiv,
          currency,
          status: 'ready-to-cancel',
          reason: this.buildReason(noCount, noResponseCount),
          yesCount,
          noCount,
          littleCount,
          noResponseCount,
        });
      } else if (littleCount > 0) {
        healthIssues.push({
          id: sub.id,
          name: sub.name,
          monthlyEquivalent: monthlyEquiv,
          currency,
          status: 'low-usage',
          reason: this.buildReason(noCount, noResponseCount, littleCount),
          yesCount,
          noCount,
          littleCount,
          noResponseCount,
        });
      }
    }

    return healthIssues;
  }

  private buildReason(noCount: number, noResponseCount: number, littleCount?: number): string {
    const parts: string[] = [];
    
    if (noCount > 0) {
      parts.push(`${noCount} NO`);
    }
    if (littleCount && littleCount > 0) {
      parts.push(`${littleCount} LITTLE`);
    }
    if (noResponseCount > 0) {
      parts.push(`${noResponseCount} no response`);
    }

    return parts.join(', ');
  }

  private findSubscriptionsWithoutUsers(subscriptions: Subscription[]): SubscriptionWithoutUsers[] {
    return subscriptions
      .filter(sub => !sub.slackUserIds || sub.slackUserIds.length === 0)
      .map(sub => {
        const { currency } = sub.cost.toPrimitives();
        return {
          id: sub.id,
          name: sub.name,
          monthlyEquivalent: Math.round(this.getMonthlyEquivalent(sub) * 100) / 100,
          currency,
        };
      });
  }

  private getUpcomingRenewals(subscriptions: Subscription[]): UpcomingRenewal[] {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return subscriptions
    .filter(sub => {
      const renewalDate = sub.renewalDate;
      return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
    })
    .map(sub => {
      const renewalDate = sub.renewalDate;
      const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const { amount, currency } = sub.cost.toPrimitives();

      return {
        id: sub.id,
        name: sub.name,
        amount: amount,
        currency: currency,
        renewalDate: renewalDate.toISOString(),  
        daysUntil,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

  private calculateProjectExpenses(subscriptions: Subscription[]): ProjectExpense[] {
    const projectMap = new Map<string, { currency: string; amount: number; count: number }>();

    subscriptions.forEach(sub => {
      const { currency } = sub.cost.toPrimitives();
      const monthlyEquiv = this.getMonthlyEquivalent(sub);
      
      // If subscription has no projects, assign to "No Project"
      const projects = sub.projects.length > 0 ? sub.projects : ['No Project'];
      
      // Add this subscription to ALL its projects
      projects.forEach(project => {
        const key = `${project}|${currency}`;
        const existing = projectMap.get(key) || { currency, amount: 0, count: 0 };
        projectMap.set(key, {
          currency,
          amount: existing.amount + monthlyEquiv,
          count: existing.count + 1,
        });
      });
    });

    return Array.from(projectMap.entries())
      .map(([key, data]) => {
        const [project] = key.split('|');
        return {
          project,
          currency: data.currency,
          monthlyAmount: Math.round(data.amount * 100) / 100,
          subscriptionCount: data.count,
        };
      })
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  }
}