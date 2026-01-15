import { prisma } from '@/src/lib/prisma';
import { randomBytes } from 'crypto';

export interface SessionPrimitives {
  id: string;
  slackUserId: string;
  slackWorkspaceId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionRepository {
  async create(slackUserId: string, slackWorkspaceId: string, expiresInDays: number = 7): Promise<SessionPrimitives> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const session = await prisma.session.create({
      data: {
        slackUserId,
        slackWorkspaceId,
        token,
        expiresAt,
      },
    });

    return session;
  }

  async findByToken(token: string): Promise<SessionPrimitives | null> {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) return null;

    // Check if expired
    if (session.expiresAt < new Date()) {
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

