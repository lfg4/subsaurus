import { SyncSlackUsersService } from '../application/SyncSlackUsers.service';
import { SlackUser } from '../domain/SlackUser';
import type { SlackUserRepository } from '../infrastructure/SlackUserRepository';

describe('SyncSlackUsersService', () => {
  let service: SyncSlackUsersService;
  let slackUserRepository: jest.Mocked<SlackUserRepository>;
  const originalEnv = process.env.SLACK_BOT_TOKEN;

  beforeEach(() => {
    process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';

    slackUserRepository = {
      findByWorkspaceId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlackUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new SyncSlackUsersService(slackUserRepository);
  });

  afterEach(() => {
    process.env.SLACK_BOT_TOKEN = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error if SLACK_BOT_TOKEN not configured', () => {
      delete process.env.SLACK_BOT_TOKEN;

      expect(() => new SyncSlackUsersService(slackUserRepository)).toThrow(
        'Slack bot token not configured'
      );
    });
  });

  describe('execute', () => {
    it('should sync users from Slack API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          members: [
            {
              id: 'U123',
              deleted: false,
              is_bot: false,
              profile: {
                real_name: 'John Doe',
                display_name: 'john',
                email: 'john@example.com',
              },
              team_id: 'WS123',
            },
          ],
        }),
      }) as any;

      slackUserRepository.findByWorkspaceId.mockResolvedValue([]);
      slackUserRepository.save.mockResolvedValue(undefined);

      await service.execute('WS123');

      expect(slackUserRepository.save).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://slack.com/api/users.list',
        expect.any(Object)
      );
    });

    it('should not create duplicate users if they already exist', async () => {
      const existingUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'john',
        email: 'john@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'user',
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          members: [
            {
              id: 'U123',
              deleted: false,
              is_bot: false,
              profile: {
                real_name: 'John Updated',
                display_name: 'john_updated',
                email: 'john.new@example.com',
              },
              team_id: 'WS123',
            },
          ],
        }),
      }) as any;

      slackUserRepository.findByWorkspaceId.mockResolvedValue([existingUser]);
      slackUserRepository.save.mockResolvedValue(undefined);

      await service.execute('WS123');

      expect(slackUserRepository.save).not.toHaveBeenCalled();
    });

    it('should mark deleted users as inactive', async () => {
      const existingUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'john',
        email: 'john@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'user',
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          members: [
            {
              id: 'U123',
              deleted: true,
              is_bot: false,
              profile: {
                real_name: 'John Doe',
                display_name: 'john',
                email: 'john@example.com',
              },
              team_id: 'WS123',
            },
          ],
        }),
      }) as any;

      slackUserRepository.findByWorkspaceId.mockResolvedValue([existingUser]);
      slackUserRepository.delete.mockResolvedValue(undefined);

      await service.execute('WS123');

      expect(slackUserRepository.delete).toHaveBeenCalled();
    });

    it('should filter out bots', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          members: [
            {
              id: 'B123',
              deleted: false,
              is_bot: true,
              profile: {
                real_name: 'Bot User',
                display_name: 'bot',
                email: 'bot@example.com',
              },
              team_id: 'WS123',
            },
          ],
        }),
      }) as any;

      slackUserRepository.findByWorkspaceId.mockResolvedValue([]);

      await service.execute('WS123');

      expect(slackUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
