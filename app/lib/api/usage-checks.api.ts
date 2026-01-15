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
  
  async getAll(subscriptionId?: number, workspaceId?: string): Promise<EnrichedUsageCheckDTO[]> {
    const params: Record<string, string | number> = {};
    if (subscriptionId) params.subscriptionId = subscriptionId;
    if (workspaceId) params.workspaceId = workspaceId;
    
    return apiClient.get<EnrichedUsageCheckDTO[]>('/usage-checks', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  async getById(id: number): Promise<UsageCheckPrimitives> {
    return apiClient.get<UsageCheckPrimitives>(`/usage-checks/${id}`);
  }

  async getResponses(usageCheckId: number): Promise<UsageResponsePrimitives[]> {
    return apiClient.get<UsageResponsePrimitives[]>(`/usage-checks/${usageCheckId}/responses`);
  }

  async resend(usageCheckId: number): Promise<{ success: boolean; sent: number; failed: number; total?: number; message?: string }> {
    return apiClient.post<{ success: boolean; sent: number; failed: number; total?: number; message?: string }>(`/usage-checks/${usageCheckId}/resend`);
  }
}

export const usageChecksApi = new UsageChecksApi();

