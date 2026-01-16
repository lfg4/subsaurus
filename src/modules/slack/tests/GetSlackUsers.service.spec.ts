import { GetSlackUsersService } from '../application/GetSlackUsers.service';
import { SlackUser } from '../domain/SlackUser';
import type { SlackUserRepository } from '../infrastructure/SlackUserRepository';

describe('GetSlackUsersService', () => {
  let service: GetSlackUsersService;
  let slackUserRepository: jest.Mocked<SlackUserRepository>;

  beforeEach(() => {
    slackUserRepository = {
      findByWorkspaceId: jest.fn(),
      findBySlackUserId: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new GetSlackUsersService(slackUserRepository);
  });

  describe('execute', () => {
    it('should return all users from workspace', async () => {
      const mockUsers = [
        SlackUser.create({
          slackUserId: 'U123',
          slackWorkspaceId: 'WS123',
          displayName: 'john',
          email: 'john@example.com',
          avatarUrl: null,
          isActive: true,
          role: 'user',
        }),
        SlackUser.create({
          slackUserId: 'U456',
          slackWorkspaceId: 'WS123',
          displayName: 'jane',
          email: 'jane@example.com',
          avatarUrl: null,
          isActive: false,
          role: 'user',
        }),
      ];

      slackUserRepository.findByWorkspaceId.mockResolvedValue(mockUsers);

      const result = await service.execute('WS123');

      expect(result).toHaveLength(2);
      expect(slackUserRepository.findByWorkspaceId).toHaveBeenCalledWith('WS123');
    });

    it('should return both active and inactive users', async () => {
      const mockUsers = [
        SlackUser.create({
          slackUserId: 'U123',
          slackWorkspaceId: 'WS123',
          displayName: 'john',
          email: 'john@example.com',
          avatarUrl: null,
          isActive: true,
          role: 'user',
        }),
        SlackUser.create({
          slackUserId: 'U456',
          slackWorkspaceId: 'WS123',
          displayName: 'jane',
          email: 'jane@example.com',
          avatarUrl: null,
          isActive: false,
          role: 'user',
        }),
      ];

      slackUserRepository.findByWorkspaceId.mockResolvedValue(mockUsers);

      const result = await service.execute('WS123');

      expect(result).toHaveLength(2);
      expect(result.some(u => u.isActive)).toBe(true);
      expect(result.some(u => !u.isActive)).toBe(true);
    });

    it('should return empty array when no users found', async () => {
      slackUserRepository.findByWorkspaceId.mockResolvedValue([]);

      const result = await service.execute('WS999');

      expect(result).toEqual([]);
    });

    it('should preserve all user properties', async () => {
      const mockUsers = [
        SlackUser.create({
          slackUserId: 'U789',
          slackWorkspaceId: 'WS123',
          displayName: 'admin',
          email: 'admin@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          isActive: true,
          role: 'admin',
        }),
      ];

      slackUserRepository.findByWorkspaceId.mockResolvedValue(mockUsers);

      const result = await service.execute('WS123');

      expect(result[0].slackUserId).toBe('U789');
      expect(result[0].displayName).toBe('admin');
      expect(result[0].role).toBe('admin');
      expect(result[0].avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(result[0].email).toBe('admin@example.com');
    });
  });
});

