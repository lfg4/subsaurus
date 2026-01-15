import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository, SlackUserWithAuth } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    access_token?: string;
    scope?: string;
    token_type?: string;
  };
  error?: string;
}

export interface SlackOpenIDUserInfo {
  ok: boolean;
  sub?: string; // user ID
  'https://slack.com/team_id'?: string;
  'https://slack.com/user_id'?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  'https://slack.com/team_name'?: string;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  user?: SlackUserWithAuth;
  error?: string;
  message?: string;
}

export class AuthenticateUserService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository,
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(code: string): Promise<AuthResult> {
    try {
      // 1. Intercambiar code por access_token
      const oauthResponse = await this.exchangeCodeForToken(code);
      
      if (!oauthResponse.ok || !oauthResponse.authed_user?.access_token) {
        return {
          success: false,
          error: 'oauth_failed',
          message: 'Failed to authenticate with Slack',
        };
      }

      // 2. Obtener información del usuario usando OpenID Connect
      const userInfo = await this.getUserInfo(oauthResponse.authed_user.access_token);
      
      if (!userInfo.ok || !userInfo['https://slack.com/user_id'] || !userInfo['https://slack.com/team_id']) {
        return {
          success: false,
          error: 'user_info_failed',
          message: 'Failed to get user information from Slack',
        };
      }

      const slackUserId = userInfo['https://slack.com/user_id'];
      const workspaceId = userInfo['https://slack.com/team_id'];

      // 3. VALIDACIÓN 1: ¿Workspace registrado y activo?
      const workspace = await this.settingsRepository.findByWorkspace(workspaceId);
      
      if (!workspace) {
        return {
          success: false,
          error: 'workspace_not_found',
          message: 'Your Slack workspace is not registered in Subsaurus. Contact your organization admin.',
        };
      }

      if (!workspace.isActive) {
        return {
          success: false,
          error: 'workspace_inactive',
          message: 'Your workspace access has been disabled. Contact support.',
        };
      }

      // 4. VALIDACIÓN 2: ¿Usuario existe en nuestra BD?
      const user = await this.slackUserRepository.findBySlackUserId(slackUserId);
      
      if (!user) {
        return {
          success: false,
          error: 'user_not_found',
          message: 'User not registered. Contact your workspace admin.',
        };
      }

      // 5. VALIDACIÓN 3: ¿Usuario está activo?
      if (!user.isActive) {
        return {
          success: false,
          error: 'user_inactive',
          message: 'Your account has been disabled. Contact support.',
        };
      }

      // 6. VALIDACIÓN 4: ¿Usuario tiene rol admin?
      if (user.role !== 'admin') {
        return {
          success: false,
          error: 'admin_required',
          message: 'Only workspace admins can access Subsaurus. Contact your admin to request access.',
        };
      }

      // 7. Limpiar sesiones anteriores del usuario
      await this.sessionRepository.deleteByUserId(slackUserId);

      // 8. Crear nueva sesión
      const session = await this.sessionRepository.create(slackUserId, workspaceId, 7);

      console.log(`✅ User authenticated: ${slackUserId} from workspace ${workspaceId}`);

      return {
        success: true,
        sessionToken: session.token,
        user,
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return {
        success: false,
        error: 'internal_error',
        message: 'An error occurred during authentication. Please try again.',
      };
    }
  }

  private async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Slack OAuth configuration');
    }

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    return response.json();
  }

  private async getUserInfo(accessToken: string): Promise<SlackOpenIDUserInfo> {
    const response = await fetch('https://slack.com/api/openid.connect.userInfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.json();
  }
}

