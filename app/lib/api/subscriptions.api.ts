import { apiClient } from './client';
import type { SubscriptionPrimitives } from '@/src/modules/subscription/domain/Subscription';
import type { RenewalCycle } from '@/src/types/enums';

export interface CreateSubscriptionDTO {
  slackWorkspaceId?: string;
  createdBySlackUserId?: string;
  name: string;
  costAmount: number;
  costCurrency?: string;
  renewalCycle: RenewalCycle;
  renewalDate: string;
  slackUserIds?: string[];
  project?: string; // Can be comma-separated for multiple projects
  projects?: string[]; // Alternative: array of projects
  notes?: string;
}

export interface UpdateSubscriptionDTO {
  name?: string;
  costAmount?: number;
  costCurrency?: string;
  renewalCycle?: RenewalCycle;
  renewalDate?: string;
  project?: string; // Can be comma-separated for multiple projects
  projects?: string[]; // Alternative: array of projects
  slackUserIds?: string[];
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SubscriptionsApi {
  
  async getAll(workspaceId?: string): Promise<SubscriptionPrimitives[]> {
    return apiClient.get<SubscriptionPrimitives[]>('/subscriptions', {
      params: workspaceId ? { workspaceId } : undefined,
    });
  }

  
  async getById(id: number): Promise<SubscriptionPrimitives> {
    return apiClient.get<SubscriptionPrimitives>(`/subscriptions/${id}`);
  }

  
  async create(data: CreateSubscriptionDTO): Promise<ApiResponse<SubscriptionPrimitives>> {
    return apiClient.post<ApiResponse<SubscriptionPrimitives>>('/subscriptions', data);
  }

  
  async update(id: number, data: UpdateSubscriptionDTO): Promise<ApiResponse<SubscriptionPrimitives>> {
    return apiClient.patch<ApiResponse<SubscriptionPrimitives>>(`/subscriptions/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/subscriptions/${id}`);
  }

  async requestUsers(id: number): Promise<{ success: boolean; sentCount: number; message: string }> {
    return apiClient.post<{ success: boolean; sentCount: number; message: string }>(
      `/subscriptions/${id}/request-users`,
      {}
    );
  }
}

export const subscriptionsApi = new SubscriptionsApi();

