import { apiClient } from './client';

export interface SlackUserDTO {
  id?: string;
  slackUserId: string;
  slackWorkspaceId: string;
  realName: string;
  displayName: string;
  email: string | null;
  avatarUrl?: string;
  isBot: boolean;
  role: string;
  isActive: boolean;
  updatedAt: Date;
}

class UsersApi {
  async getAll(workspaceId: string): Promise<SlackUserDTO[]> {
    return apiClient.get<SlackUserDTO[]>('/users', {
      params: { workspaceId }
    });
  }
}

export const usersApi = new UsersApi();

