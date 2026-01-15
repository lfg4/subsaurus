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
      // 1. Buscar sesión por token
      const session = await this.sessionRepository.findByToken(token);

      if (!session) {
        return {
          valid: false,
          error: 'Session not found or expired',
        };
      }

      // 2. Validar que la sesión no haya expirado (ya lo hace findByToken)
      // 3. Buscar usuario
      const user = await this.slackUserRepository.findBySlackUserId(session.slackUserId);

      if (!user) {
        // Usuario fue eliminado, invalidar sesión
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User not found',
        };
      }

      // 4. Validar que usuario esté activo
      if (!user.isActive) {
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User account is disabled',
        };
      }

      // 5. Validar que usuario siga siendo admin
      if (user.role !== 'admin') {
        await this.sessionRepository.delete(session.id);
        return {
          valid: false,
          error: 'User is no longer an admin',
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

