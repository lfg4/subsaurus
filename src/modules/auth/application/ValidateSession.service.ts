import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import { UserMapper } from './mappers/UserMapper';
import type { ValidateSessionResultDTO } from './dtos/ValidateSessionResult.dto';
import {
  SessionNotFoundException,
  SessionExpiredException,
  UserNotRegisteredException,
  UserInactiveException,
  AdminRoleRequiredException,
  type AuthException,
} from '../domain/exceptions/AuthException';
import { logger } from '@/src/shared/infrastructure/Logger';

export class ValidateSessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository
  ) {}

  async execute(token: string): Promise<ValidateSessionResultDTO> {
    try {
      const session = await this.sessionRepository.findByToken(token);

      if (!session) {
        throw new SessionNotFoundException();
      }

      if (session.isExpired()) {
        await this.sessionRepository.delete(session.id);
        throw new SessionExpiredException();
      }

      const user = await this.slackUserRepository.findBySlackUserId(session.slackUserId);

      if (!user) {
        await this.sessionRepository.delete(session.id);
        throw new UserNotRegisteredException(session.slackUserId);
      }

      if (!user.isUserActive()) {
        await this.sessionRepository.delete(session.id);
        throw new UserInactiveException(session.slackUserId);
      }

      if (!user.isAdmin()) {
        await this.sessionRepository.delete(session.id);
        throw new AdminRoleRequiredException(session.slackUserId);
      }

      return {
        valid: true,
        user: UserMapper.toDTO(user),
      };
    } catch (error) {
      if (this.isAuthException(error)) {
        logger.debug('Session validation failed', {
          code: error.code,
          message: error.message,
        });

        return {
          valid: false,
          error: error.message,
        };
      }

      logger.error('Unexpected session validation error', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        valid: false,
        error: 'Validation error',
      };
    }
  }

  private isAuthException(error: unknown): error is AuthException {
    return error instanceof Error && 'code' in error;
  }
}
