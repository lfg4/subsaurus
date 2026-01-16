import { apiClient } from './client';
import type {
  CurrencyTotal,
  SubscriptionHealth,
  SubscriptionWithoutUsers,
  UpcomingRenewal,
  ProjectExpense,
} from '@/src/modules/analytics/domain/types';

export interface DashboardData {
  currencyTotals: CurrencyTotal[];
  subscriptionHealth: SubscriptionHealth[];
  subscriptionsWithoutUsers: SubscriptionWithoutUsers[];
  upcomingRenewals: UpcomingRenewal[];
  projectExpenses: ProjectExpense[];
  convertedTotal: number;
  preferredCurrency: string;
}

class AnalyticsApi {
  async getDashboard(workspaceId: string): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/analytics/dashboard', {
      params: { workspaceId }
    });
  }
}

export const analyticsApi = new AnalyticsApi();

