import { prisma } from '@/src/lib/prisma';
import { Session } from '../domain/Session';

export class SessionRepository {
  async save(session: Session): Promise<void> {
    const primitives = session.toPrimitives();
    
    await prisma.session.create({
      data: primitives,
    });
  }

  async findByToken(token: string): Promise<Session | null> {
    const sessionData = await prisma.session.findUnique({
      where: { token },
    });

    if (!sessionData) return null;

    return Session.fromPrimitives(sessionData);
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
}

