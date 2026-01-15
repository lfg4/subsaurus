import { apiClient } from './client';

export interface SessionDTO {
  valid: boolean;
  user?: {
    slackUserId: string;
    slackWorkspaceId: string;
    realName: string;
    displayName: string;
    email: string | null;
    role: string;
  };
}

class AuthApi {
  async getSession(): Promise<SessionDTO> {
    return apiClient.get<SessionDTO>('/auth/session');
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}

export const authApi = new AuthApi();

