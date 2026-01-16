import { AuthenticateUserService } from '../application/AuthenticateUser.service';
import { SlackUser } from '@/src/modules/slack/domain/SlackUser';
import { AppSettings } from '@/src/shared/domain/AppSettings';
import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import type { SlackOAuthPort } from '../domain/ports/SlackOAuthPort';
import type { TokenGenerator } from '../domain/services/TokenGenerator';

describe('AuthenticateUserService', () => {
  let service: AuthenticateUserService;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let slackUserRepository: jest.Mocked<SlackUserRepository>;
  let settingsRepository: jest.Mocked<SettingsRepository>;
  let slackOAuthClient: jest.Mocked<SlackOAuthPort>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;

  beforeEach(() => {
    sessionRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      delete: jest.fn(),
      deleteExpired: jest.fn(),
      deleteByUserId: jest.fn(),
    } as any;

    slackUserRepository = {
      findBySlackUserId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    settingsRepository = {
      findByWorkspace: jest.fn(),
      getDaysBeforeRenewal: jest.fn(),
      updateDaysBeforeRenewal: jest.fn(),
    } as any;

    slackOAuthClient = {
      exchangeCodeForToken: jest.fn(),
      getUserInfo: jest.fn(),
    } as any;

    tokenGenerator = {
      generate: jest.fn().mockReturnValue('mock-session-token-123'),
    } as any;

    service = new AuthenticateUserService(
      sessionRepository,
      slackUserRepository,
      settingsRepository,
      slackOAuthClient,
      tokenGenerator
    );
  });

  describe('execute', () => {
    it('should authenticate admin user successfully', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS123',
      };

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'admin',
        email: 'admin@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'admin',
      });

      const mockSettings = AppSettings.create('WS123', 7);

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);
      sessionRepository.deleteByUserId.mockResolvedValue(undefined);
      sessionRepository.save.mockResolvedValue(undefined);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(true);
      expect(result.sessionToken).toBe('mock-session-token-123');
      expect(result.user?.slackUserId).toBe('U123');
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should fail with invalid OAuth code', async () => {
      const mockOAuthResponse = {
        ok: false,
      };

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);

      const result = await service.execute('invalid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('oauth_failed');
    });

    it('should fail if workspace is not registered', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS999',
      };

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(null);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('workspace_not_found');
    });

    it('should fail if workspace is inactive', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS123',
      };

      const mockSettings = AppSettings.create('WS123', 7);
      mockSettings.deactivate();

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('workspace_inactive');
    });

    it('should fail if user is not registered', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U999',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U999',
        teamId: 'WS123',
      };

      const mockSettings = AppSettings.create('WS123', 7);

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);
      slackUserRepository.findBySlackUserId.mockResolvedValue(null);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_not_found');
    });

    it('should fail if user is inactive', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS123',
      };

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'inactive',
        email: 'inactive@example.com',
        avatarUrl: null,
        isActive: false,
        role: 'admin',
      });

      const mockSettings = AppSettings.create('WS123', 7);

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_inactive');
    });

    it('should fail if user is not admin', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS123',
      };

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'member',
        email: 'member@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'user',
      });

      const mockSettings = AppSettings.create('WS123', 7);

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);

      const result = await service.execute('valid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('admin_required');
    });

    it('should delete previous sessions before creating new one', async () => {
      const mockOAuthResponse = {
        ok: true,
        authed_user: {
          id: 'U123',
          access_token: 'slack-access-token',
        },
      };

      const mockUserInfo = {
        ok: true,
        userId: 'U123',
        teamId: 'WS123',
      };

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'admin',
        email: 'admin@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'admin',
      });

      const mockSettings = AppSettings.create('WS123', 7);

      slackOAuthClient.exchangeCodeForToken.mockResolvedValue(mockOAuthResponse);
      slackOAuthClient.getUserInfo.mockResolvedValue(mockUserInfo);
      settingsRepository.findByWorkspace.mockResolvedValue(mockSettings);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);
      sessionRepository.deleteByUserId.mockResolvedValue(undefined);
      sessionRepository.save.mockResolvedValue(undefined);

      await service.execute('valid-code');

      expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith('U123');
      expect(sessionRepository.save).toHaveBeenCalled();
    });
  });
});
