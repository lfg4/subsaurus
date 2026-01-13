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

  async findRenewingTomorrow(): Promise<Subscription[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

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

    return subscriptions.map(s => this.toEntity(s));
  }

  async updateRenewalDate(id: number, newRenewalDate: Date): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data: { renewalDate: newRenewalDate },
      include: {
        subscriptionUsers: true,
      },
    });

    return this.toEntity(subscription);
  }

  private toEntity(subscription: any): Subscription {
    return new Subscription({
      id: subscription.id,
      slackWorkspaceId: subscription.slackWorkspaceId,
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
