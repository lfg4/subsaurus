import { prisma } from '@/src/lib/prisma';
import { SubscriptionEntity } from '../entities/Subscription';
import type { CreateSubscriptionDto } from '../dtos/subscription.dto';

export class SubscriptionRepository {
  async create(dto: CreateSubscriptionDto, workspaceId: string, createdBy: string): Promise<SubscriptionEntity> {
    const subscription = await prisma.subscription.create({
      data: {
        slackWorkspaceId: workspaceId,
        createdBySlackUser: createdBy,
        name: dto.name,
        project: dto.projects[0] || null,
        renewalCycle: 'MONTHLY', // Valores: 'MONTHLY', 'YEARLY', 'CUSTOM'
        renewalDate: new Date(dto.renewalDate),
        costAmount: dto.price,
        costCurrency: 'EUR',
        subscriptionUsers: {
          create: dto.slackUserIds.map(userId => ({
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

  async findAll(): Promise<SubscriptionEntity[]> {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        subscriptionUsers: true
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map(sub => this.toEntity(sub));
  }

  async findById(id: number): Promise<SubscriptionEntity | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        subscriptionUsers: true
      }
    });

    if (!subscription) return null;

    return this.toEntity(subscription);
  }

  async findByUser(slackUserId: string): Promise<SubscriptionEntity[]> {
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

  private toEntity(subscription: any): SubscriptionEntity {
    return new SubscriptionEntity({
      id: subscription.id,
      name: subscription.name,
      price: subscription.costAmount,
      renewalDate: subscription.renewalDate,
      slackUserIds: subscription.subscriptionUsers?.map((su: any) => su.slackUserId) || [],
      projects: subscription.project ? [subscription.project] : [],
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    });
  }
}
