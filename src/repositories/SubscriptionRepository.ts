import { prisma } from '@/src/lib/prisma';
import { Subscription } from '../entities/Subscription';
import type { SlackSubscriptionData } from '../types/slack';

export class SubscriptionRepository {
  async create(
    data: SlackSubscriptionData, 
    workspaceId: string, 
    createdBy: string
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data: {
        slackWorkspaceId: workspaceId,
        createdBySlackUser: createdBy,
        name: data.name,
        project: data.projects[0] || null,
        renewalCycle: data.renewalCycle,
        renewalDate: new Date(data.renewalDate),
        costAmount: data.price,
        costCurrency: data.currency,
        subscriptionUsers: {
          create: data.users.map(userId => ({
            slackWorkspaceId: workspaceId,
            slackUserId: userId,
          }))
        }
      },
      include: {
        subscriptionUsers: true
      }
    });

    return this.toEntity(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        subscriptionUsers: true
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map(sub => this.toEntity(sub));
  }

  async findById(id: number): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        subscriptionUsers: true
      }
    });

    if (!subscription) return null;

    return this.toEntity(subscription);
  }

  async findByUser(slackUserId: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriptionUsers: {
          some: {
            slackUserId: slackUserId
          }
        }
      },
      include: {
        subscriptionUsers: true
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map(sub => this.toEntity(sub));
  }

  async delete(id: number): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  private toEntity(subscription: any): Subscription {
    return new Subscription({
      id: subscription.id,
      name: subscription.name,
      price: subscription.costAmount,
      renewalCycle: subscription.renewalCycle,
      renewalDate: subscription.renewalDate,
      slackUserIds: subscription.subscriptionUsers?.map((su: any) => su.slackUserId) || [],
      projects: subscription.project ? [subscription.project] : [],
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    });
  }
}
