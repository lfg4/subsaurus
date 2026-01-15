import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import type { SlackOAuthPort } from '../domain/ports/SlackOAuthPort';
import type { SlackUser } from '@/src/modules/slack/domain/SlackUser';

export interface AuthResultDTO {
  success: boolean;
  sessionToken?: string;
  user?: {
    id: string;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
  };
  error?: string;
  message?: string;
}

export class AuthenticateUserService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly slackOAuthClient: SlackOAuthPort
  ) {}

  async execute(code: string): Promise<AuthResultDTO> {
    try {
      const oauthResponse = await this.slackOAuthClient.exchangeCodeForToken(code);
      
      if (!oauthResponse.ok || !oauthResponse.authed_user?.access_token) {
        return {
          success: false,
          error: 'oauth_failed',
          message: 'Failed to authenticate with Slack',
        };
      }

      const userInfo = await this.slackOAuthClient.getUserInfo(oauthResponse.authed_user.access_token);
      
      if (!userInfo.ok || !userInfo.userId || !userInfo.teamId) {
        return {
          success: false,
          error: 'user_info_failed',
          message: 'Failed to get user information from Slack',
        };
      }

      const slackUserId = userInfo.userId;
      const workspaceId = userInfo.teamId;

      const workspace = await this.settingsRepository.findByWorkspace(workspaceId);
      
      if (!workspace) {
        return {
          success: false,
          error: 'workspace_not_found',
          message: 'Your Slack workspace is not registered in Subsaurus. Contact your organization admin.',
        };
      }

      if (!workspace.isWorkspaceActive()) {
        return {
          success: false,
          error: 'workspace_inactive',
          message: 'Your workspace access has been disabled. Contact support.',
        };
      }

      const user = await this.slackUserRepository.findBySlackUserId(slackUserId);
      
      if (!user) {
        return {
          success: false,
          error: 'user_not_found',
          message: 'User not registered. Contact your workspace admin.',
        };
      }

      if (!user.canLogin()) {
        if (!user.isUserActive()) {
          return {
            success: false,
            error: 'user_inactive',
            message: 'Your account has been disabled. Contact support.',
          };
        }
        
        return {
          success: false,
          error: 'admin_required',
          message: 'Only workspace admins can access Subsaurus. Contact your admin to request access.',
        };
      }

      await this.sessionRepository.deleteByUserId(slackUserId);

      const session = await this.sessionRepository.create(slackUserId, workspaceId, 7);

      console.log(`✅ User authenticated: ${slackUserId} from workspace ${workspaceId}`);

      return {
        success: true,
        sessionToken: session.token,
        user: this.toUserDTO(user),
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

  private toUserDTO(user: SlackUser) {
    const primitives = user.toPrimitives();
    return {
      id: primitives.id.toString(),
      slackUserId: primitives.slackUserId,
      slackWorkspaceId: primitives.slackWorkspaceId,
      displayName: primitives.displayName,
      email: primitives.email,
      avatarUrl: primitives.avatarUrl,
      role: primitives.role,
    };
  }
}

