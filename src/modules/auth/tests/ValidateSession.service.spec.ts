import { ValidateSessionService } from '../application/ValidateSession.service';
import { Session } from '../domain/Session';
import { SlackUser } from '@/src/modules/slack/domain/SlackUser';
import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';

describe('ValidateSessionService', () => {
  let service: ValidateSessionService;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let slackUserRepository: jest.Mocked<SlackUserRepository>;

  beforeEach(() => {
    sessionRepository = {
      findByToken: jest.fn(),
      save: jest.fn(),
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

    service = new ValidateSessionService(sessionRepository, slackUserRepository);
  });

  describe('execute', () => {
    it('should validate active session for admin user', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const mockSession = Session.fromPrimitives({
        id: 1,
        token: 'valid-token',
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        expiresAt: futureDate,
        createdAt: new Date(),
      });

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'admin',
        email: 'admin@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'admin',
      });

      sessionRepository.findByToken.mockResolvedValue(mockSession);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);

      const result = await service.execute('valid-token');

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.slackUserId).toBe('U123');
    });

    it('should invalidate expired session', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const mockSession = Session.fromPrimitives({
        id: 1,
        token: 'expired-token',
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        expiresAt: pastDate,
        createdAt: new Date(),
      });

      sessionRepository.findByToken.mockResolvedValue(mockSession);
      sessionRepository.delete.mockResolvedValue(undefined);

      const result = await service.execute('expired-token');

      expect(result.valid).toBe(false);
      expect(sessionRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return invalid for non-existent token', async () => {
      sessionRepository.findByToken.mockResolvedValue(null);

      const result = await service.execute('non-existent-token');

      expect(result.valid).toBe(false);
    });

    it('should invalidate session if user not found', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const mockSession = Session.fromPrimitives({
        id: 1,
        token: 'valid-token',
        slackUserId: 'U999',
        slackWorkspaceId: 'WS123',
        expiresAt: futureDate,
        createdAt: new Date(),
      });

      sessionRepository.findByToken.mockResolvedValue(mockSession);
      slackUserRepository.findBySlackUserId.mockResolvedValue(null);
      sessionRepository.delete.mockResolvedValue(undefined);

      const result = await service.execute('valid-token');

      expect(result.valid).toBe(false);
      expect(sessionRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should invalidate session if user is inactive', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const mockSession = Session.fromPrimitives({
        id: 1,
        token: 'valid-token',
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        expiresAt: futureDate,
        createdAt: new Date(),
      });

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'inactive',
        email: 'inactive@example.com',
        avatarUrl: null,
        isActive: false,
        role: 'admin',
      });

      sessionRepository.findByToken.mockResolvedValue(mockSession);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);
      sessionRepository.delete.mockResolvedValue(undefined);

      const result = await service.execute('valid-token');

      expect(result.valid).toBe(false);
      expect(sessionRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should invalidate session if user is not admin', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const mockSession = Session.fromPrimitives({
        id: 1,
        token: 'valid-token',
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        expiresAt: futureDate,
        createdAt: new Date(),
      });

      const mockUser = SlackUser.create({
        slackUserId: 'U123',
        slackWorkspaceId: 'WS123',
        displayName: 'member',
        email: 'member@example.com',
        avatarUrl: null,
        isActive: true,
        role: 'user',
      });

      sessionRepository.findByToken.mockResolvedValue(mockSession);
      slackUserRepository.findBySlackUserId.mockResolvedValue(mockUser);
      sessionRepository.delete.mockResolvedValue(undefined);

      const result = await service.execute('valid-token');

      expect(result.valid).toBe(false);
      expect(sessionRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
