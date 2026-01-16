import { prisma } from '@/src/lib/prisma';
import { Subscription } from '../domain/Subscription';


export class SubscriptionRepository {
  async save(subscription: Subscription, userIds: string[]): Promise<Subscription> {
    const primitives = subscription.toPrimitives();

    const created = await prisma.subscription.create({
      data: {
        slackWorkspaceId: primitives.slackWorkspaceId,
        createdBySlackUser: primitives.createdBySlackUserId,
        name: primitives.name,
        projects: primitives.projects.length > 0 ? primitives.projects : [],
        renewalCycle: primitives.renewalCycle,
        renewalDate: primitives.renewalDate,
        costAmount: primitives.costAmount,
        costCurrency: primitives.costCurrency,
        notes: primitives.notes,
        subscriptionUsers: {
          create: userIds.map(userId => ({
            slackWorkspaceId: primitives.slackWorkspaceId,
            slackUserId: userId,
          })),
        },
      },
      include: {
        subscriptionUsers: true,
      },
    });

    return this.toDomain(created);
  }

  async update(subscription: Subscription): Promise<void> {
    const primitives = subscription.toPrimitives();

    await prisma.subscription.update({
      where: { id: primitives.id },
      data: {
        name: primitives.name,
        renewalCycle: primitives.renewalCycle,
        renewalDate: primitives.renewalDate,
        costAmount: primitives.costAmount,
        costCurrency: primitives.costCurrency,
        projects: primitives.projects.length > 0 ? primitives.projects : [],
        notes: primitives.notes,
        updatedAt: primitives.updatedAt,
      },
    });
  }

async updateUsersInDatabase(subscriptionId: number, slackWorkspaceId: string, slackUserIds: string[]): Promise<void> {
    await prisma.subscriptionUser.deleteMany({
      where: { subscriptionId },
    });

    if (slackUserIds.length > 0) {
      await prisma.subscriptionUser.createMany({
        data: slackUserIds.map(userId => ({
          subscriptionId,
          slackWorkspaceId,
          slackUserId: userId,
        })),
      });
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<Subscription | null> {
    const subscriptionData = await prisma.subscription.findUnique({
      where: { id },
      include: {
        subscriptionUsers: true,
      },
    });

    if (!subscriptionData) return null;

    return this.toDomain(subscriptionData);
  }

  async findAll(slackWorkspaceId?: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: slackWorkspaceId ? { slackWorkspaceId } : undefined,
      include: {
        subscriptionUsers: true,
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map(s => this.toDomain(s));
  }

  async findRenewingTomorrow(): Promise<Subscription[]> {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));

    const dayAfterTomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 2,
      0, 0, 0, 0
    ));


    const subscriptions = await prisma.subscription.findMany({
      where: {
        renewalDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        subscriptionUsers: true,
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map(s => this.toDomain(s));
  }

  private toDomain(data: any): Subscription {
    return Subscription.fromPrimitives({
      id: data.id,
      slackWorkspaceId: data.slackWorkspaceId,
      createdBySlackUserId: data.createdBySlackUser,
      name: data.name,
      costAmount: data.costAmount,
      costCurrency: data.costCurrency,
      renewalCycle: data.renewalCycle,
      renewalDate: data.renewalDate,
      slackUserIds: data.subscriptionUsers?.map((su: any) => su.slackUserId) || [],
      projects: data.projects || [],
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

