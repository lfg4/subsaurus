import { Entity } from '@/src/shared/domain/Entity';


export class SlackUser extends Entity<number> {
  private constructor(
    id: number,
    public readonly slackUserId: string,
    public readonly slackWorkspaceId: string,
    public readonly displayName: string | null,
    public readonly email: string | null,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date
  ) {
    super(id);
  }

  static create(data: {
    id?: number;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
  }): SlackUser {
    return new SlackUser(
      data.id || 0,
      data.slackUserId,
      data.slackWorkspaceId,
      data.displayName,
      data.email,
      data.avatarUrl,
      new Date()
    );
  }

  static fromPrimitives(data: {
    id: number;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  }): SlackUser {
    return new SlackUser(
      data.id,
      data.slackUserId,
      data.slackWorkspaceId,
      data.displayName,
      data.email,
      data.avatarUrl,
      data.createdAt
    );
  }

  toPrimitives(): {
    id: number;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  } {
    return {
      id: this.id,
      slackUserId: this.slackUserId,
      slackWorkspaceId: this.slackWorkspaceId,
      displayName: this.displayName,
      email: this.email,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt,
    };
  }
}

