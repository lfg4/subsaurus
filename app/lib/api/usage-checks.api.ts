import { apiClient } from './client';
import type { UsageCheckPrimitives } from '@/src/modules/usage-tracking/domain/UsageCheck';
import type { UsageResponsePrimitives } from '@/src/modules/usage-tracking/domain/UsageResponse';

export interface EnrichedUsageCheckDTO {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  periodStart: Date;
  periodEnd: Date;
  sendAt: Date;
  status: string;
  responsesCount: number;
}

class UsageChecksApi {
  
  async getAll(subscriptionId?: number): Promise<EnrichedUsageCheckDTO[]> {
    return apiClient.get<EnrichedUsageCheckDTO[]>('/usage-checks', {
      params: subscriptionId ? { subscriptionId } : undefined,
    });
  }

  async getById(id: number): Promise<UsageCheckPrimitives> {
    return apiClient.get<UsageCheckPrimitives>(`/usage-checks/${id}`);
  }

  async getResponses(usageCheckId: number): Promise<UsageResponsePrimitives[]> {
    return apiClient.get<UsageResponsePrimitives[]>(`/usage-checks/${usageCheckId}/responses`);
  }
}

export const usageChecksApi = new UsageChecksApi();

