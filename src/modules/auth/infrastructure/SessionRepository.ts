import { prisma } from '@/src/lib/prisma';
import { randomBytes } from 'crypto';
import { Session } from '../domain/Session';

export class SessionRepository {
  async create(slackUserId: string, slackWorkspaceId: string, expiresInDays: number = 7): Promise<Session> {
    const token = this.generateToken();
    const id = randomBytes(16).toString('hex');

    const sessionData = await prisma.session.create({
      data: {
        id,
        slackUserId,
        slackWorkspaceId,
        token,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      },
    });

    return Session.fromPrimitives(sessionData);
  }

  async findByToken(token: string): Promise<Session | null> {
    const sessionData = await prisma.session.findUnique({
      where: { token },
    });

    if (!sessionData) return null;

    const session = Session.fromPrimitives(sessionData);

    if (session.isExpired()) {
      await this.delete(session.id);
      return null;
    }

    return session;
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.delete({
      where: { token },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  async deleteByUserId(slackUserId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { slackUserId },
    });
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}

