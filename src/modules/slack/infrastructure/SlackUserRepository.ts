import { prisma } from '@/src/lib/prisma';
import { SlackUser } from '../domain/SlackUser';

export class SlackUserRepository {
  async save(slackUser: SlackUser): Promise<void> {
    const primitives = slackUser.toPrimitives();

    await prisma.slackUser.create({
      data: {
        slackUserId: primitives.slackUserId,
        slackWorkspaceId: primitives.slackWorkspaceId,
        displayName: primitives.displayName,
        email: primitives.email,
        avatarUrl: primitives.avatarUrl,
        role: 'user',
        isActive: true,
      },
    });
  }

  async upsert(data: {
    slackUserId: string;
    slackWorkspaceId: string;
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string;
    isActive?: boolean;
  }): Promise<void> {
    await prisma.slackUser.upsert({
      where: { slackUserId: data.slackUserId },
      update: {
        displayName: data.displayName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive ?? true,
      },
      create: {
        slackUserId: data.slackUserId,
        slackWorkspaceId: data.slackWorkspaceId,
        displayName: data.displayName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        role: data.role || 'user',
        isActive: data.isActive ?? true,
      },
    });
  }

  async findBySlackUserId(slackUserId: string): Promise<SlackUser | null> {
    const user = await prisma.slackUser.findUnique({
      where: { slackUserId },
    });

    if (!user) return null;

    return SlackUser.fromPrimitives({
      id: user.id,
      slackUserId: user.slackUserId,
      slackWorkspaceId: user.slackWorkspaceId,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<SlackUser[]> {
    const users = await prisma.slackUser.findMany({
      where: {
        slackWorkspaceId: workspaceId,
      },
    });

    return users.map(u => this.toDomain(u));
  }

  async findAdminsByWorkspaceId(workspaceId: string): Promise<SlackUser[]> {
    const users = await prisma.slackUser.findMany({
      where: {
        slackWorkspaceId: workspaceId,
        role: 'admin',
        isActive: true,
      },
    });

    return users.map(user => SlackUser.fromPrimitives({
      id: user.id,
      slackUserId: user.slackUserId,
      slackWorkspaceId: user.slackWorkspaceId,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  }

  async delete(id: number): Promise<void> {
    await prisma.slackUser.delete({
      where: {
        id: id,
      },
    });
  }

  async updateRole(slackUserId: string, role: string): Promise<void> {
    await prisma.slackUser.update({
      where: { slackUserId },
      data: { role },
    });
  }

  async setActive(slackUserId: string, isActive: boolean): Promise<void> {
    await prisma.slackUser.update({
      where: { slackUserId },
      data: { isActive },
    });
  }

  private toDomain(data: { id: number; slackUserId: string; slackWorkspaceId: string; displayName: string | null; email: string | null; avatarUrl: string | null; role: string; isActive: boolean; createdAt: Date; }): SlackUser {
    return SlackUser.fromPrimitives({
      id: data.id,
      slackUserId: data.slackUserId,
      slackWorkspaceId: data.slackWorkspaceId,
      displayName: data.displayName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      role: data.role,
      isActive: data.isActive,
      createdAt: data.createdAt,
    });
  }
}

