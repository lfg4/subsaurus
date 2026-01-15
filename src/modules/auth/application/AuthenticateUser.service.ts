import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import type { SlackOAuthPort } from '../domain/ports/SlackOAuthPort';
import type { TokenGenerator } from '../domain/services/TokenGenerator';
import { Session } from '../domain/Session';
import { UserMapper } from './mappers/UserMapper';
import type { AuthResultDTO } from './dtos/AuthResult.dto';
import {
  OAuthFailedException,
  UserInfoFailedException,
  WorkspaceNotRegisteredException,
  WorkspaceInactiveException,
  UserNotRegisteredException,
  UserInactiveException,
  AdminRoleRequiredException,
  type AuthException,
} from '../domain/exceptions/AuthException';
import { logger } from '@/src/shared/infrastructure/Logger';

export class AuthenticateUserService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly slackOAuthClient: SlackOAuthPort,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async execute(code: string): Promise<AuthResultDTO> {
    try {
      const { slackUserId, workspaceId } = await this.authenticateWithSlack(code);
      await this.validateWorkspaceAccess(workspaceId);
      const user = await this.validateUserAccess(slackUserId);
      
      await this.sessionRepository.deleteByUserId(slackUserId);

      const session = Session.create(slackUserId, workspaceId, this.tokenGenerator);
      await this.sessionRepository.save(session);

      logger.info('User authenticated successfully', {
        slackUserId,
        workspaceId,
        role: user.toPrimitives().role,
      });

      return {
        success: true,
        sessionToken: session.token,
        user: UserMapper.toDTO(user),
      };
    } catch (error) {
      if (this.isAuthException(error)) {
        logger.warn('Authentication failed', {
          code: error.code,
          message: error.message,
        });

        return {
          success: false,
          error: error.code,
          message: error.message,
        };
      }

      logger.error('Unexpected authentication error', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: 'internal_error',
        message: 'An error occurred during authentication. Please try again.',
      };
    }
  }

  private async authenticateWithSlack(code: string): Promise<{ slackUserId: string; workspaceId: string }> {
    const oauthResponse = await this.slackOAuthClient.exchangeCodeForToken(code);
    
    if (!oauthResponse.ok || !oauthResponse.authed_user?.access_token) {
      throw new OAuthFailedException();
    }

    const userInfo = await this.slackOAuthClient.getUserInfo(oauthResponse.authed_user.access_token);
    
    if (!userInfo.ok || !userInfo.userId || !userInfo.teamId) {
      throw new UserInfoFailedException();
    }

    return {
      slackUserId: userInfo.userId,
      workspaceId: userInfo.teamId,
    };
  }

  private async validateWorkspaceAccess(workspaceId: string): Promise<void> {
    const workspace = await this.settingsRepository.findByWorkspace(workspaceId);
    
    if (!workspace) {
      throw new WorkspaceNotRegisteredException(workspaceId);
    }

    if (!workspace.isWorkspaceActive()) {
      throw new WorkspaceInactiveException(workspaceId);
    }
  }

  private async validateUserAccess(slackUserId: string) {
    const user = await this.slackUserRepository.findBySlackUserId(slackUserId);
    
    if (!user) {
      throw new UserNotRegisteredException(slackUserId);
    }

    if (!user.isUserActive()) {
      throw new UserInactiveException(slackUserId);
    }

    if (!user.isAdmin()) {
      throw new AdminRoleRequiredException(slackUserId);
    }

    return user;
  }

  private isAuthException(error: unknown): error is AuthException {
    return error instanceof Error && 'code' in error;
  }
}

