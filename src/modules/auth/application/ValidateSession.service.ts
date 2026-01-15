import type { SessionRepository } from '../infrastructure/SessionRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SlackUser } from '@/src/modules/slack/domain/SlackUser';

export interface ValidateSessionResultDTO {
  valid: boolean;
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
}

export class ValidateSessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly slackUserRepository: SlackUserRepository
  ) {}

  async execute(token: string): Promise<ValidateSessionResultDTO> {
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

      if (!user.canLogin()) {
        await this.sessionRepository.delete(session.id);
        
        if (!user.isUserActive()) {
          return {
            valid: false,
            error: 'User account is disabled',
          };
        }
        
        return {
          valid: false,
          error: 'User is no longer an admin',
        };
      }

      return {
        valid: true,
        user: this.toUserDTO(user),
      };
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return {
        valid: false,
        error: 'Validation error',
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
