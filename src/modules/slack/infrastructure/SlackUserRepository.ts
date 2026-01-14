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
      },
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

  async delete(id: number): Promise<void> {
    await prisma.slackUser.delete({
      where: {
        id: id,
      },
    });
  }

  private toDomain(data: any): SlackUser {
    return SlackUser.fromPrimitives({
      id: data.id,
      slackUserId: data.slackUserId,
      slackWorkspaceId: data.slackWorkspaceId,
      displayName: data.displayName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt,
    });
  }
}

