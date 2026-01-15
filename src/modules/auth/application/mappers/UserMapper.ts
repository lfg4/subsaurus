import type { SlackUser } from '@/src/modules/slack/domain/SlackUser';

export interface UserDTO {
  id: string;
  slackUserId: string;
  slackWorkspaceId: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
}


export class UserMapper {
  static toDTO(user: SlackUser): UserDTO {
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

