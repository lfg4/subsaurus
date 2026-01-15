import { apiClient } from './client';

export interface SettingsDTO {
  id?: number;
  slackWorkspaceId?: string;
  daysBeforeRenewal: number;
  updatedAt?: Date;
}

class SettingsApi {
  async get(workspaceId: string): Promise<SettingsDTO> {
    return apiClient.get<SettingsDTO>('/settings', {
      params: { workspaceId },
    });
  }

  async update(workspaceId: string, daysBeforeRenewal: number): Promise<SettingsDTO> {
    return apiClient.post<SettingsDTO>('/settings', {
      workspaceId,
      daysBeforeRenewal,
    });
  }
}

export const settingsApi = new SettingsApi();

