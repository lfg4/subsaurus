import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository, SlackUserWithAuth } from '@/src/modules/slack/infrastructure/SlackUserRepository';

export interface ValidateSessionResult {
  valid: boolean;
  user?: SlackUserWithAuth;
  error?: string;
}

export class ValidateSessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository
  ) {}

  async execute(token: string): Promise<ValidateSessionResult> {
    try {
      const session = await this.sessionRepository.findByToken(token);

      if (!session) {
        return {
          valid: false,
          error: 'Session not found or expired',
        };
      }

      const user = await this.slackUserRepository.findBySlackUserId(session.slackUserId);

      if (!user) {
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User not found',
        };
      }

      if (!user.isActive) {
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User account is disabled',
        };
      }

      if (user.role !== 'admin') {
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User is not an admin',
        };
      }

      return {
        valid: true,
        user,
      };
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return {
        valid: false,
        error: 'Validation error',
      };
    }
  }
}

