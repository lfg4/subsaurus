import { Entity } from '@/src/shared/domain/Entity';

export type UserRole = 'admin' | 'user';

export class SlackUser extends Entity<number> {
  private constructor(
    id: number,
    public readonly slackUserId: string,
    public readonly slackWorkspaceId: string,
    public readonly displayName: string | null,
    public readonly email: string | null,
    public readonly avatarUrl: string | null,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {
    super(id);
  }

  
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  
  canLogin(): boolean {
    return this.isActive && this.isAdmin();
  }

  isUserActive(): boolean {
    return this.isActive;
  }

  static create(data: {
    id?: number;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    role?: UserRole;
    isActive?: boolean;
  }): SlackUser {
    return new SlackUser(
      data.id || 0,
      data.slackUserId,
      data.slackWorkspaceId,
      data.displayName,
      data.email,
      data.avatarUrl,
      data.role || 'user',
      data.isActive ?? true,
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
    role: string;
    isActive: boolean;
    createdAt: Date;
  }): SlackUser {
    return new SlackUser(
      data.id,
      data.slackUserId,
      data.slackWorkspaceId,
      data.displayName,
      data.email,
      data.avatarUrl,
      data.role as UserRole,
      data.isActive,
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
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
  } {
    return {
      id: this.id,
      slackUserId: this.slackUserId,
      slackWorkspaceId: this.slackWorkspaceId,
      displayName: this.displayName,
      email: this.email,
      avatarUrl: this.avatarUrl,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

