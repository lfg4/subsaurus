import { prisma } from '@/src/lib/prisma';
import { UsageCheck } from '../entities/UsageCheck';

export class UsageCheckRepository {
  async create(data: {
    slackWorkspaceId: string;
    subscriptionId: number;
    periodStart: Date;
    periodEnd: Date;
    sendAt: Date;
  }): Promise<UsageCheck> {
    const usageCheck = await prisma.usageCheck.create({
      data: {
        slackWorkspaceId: data.slackWorkspaceId,
        subscriptionId: data.subscriptionId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        sendAt: data.sendAt,
        status: 'SCHEDULED',
      },
    });

    return this.toEntity(usageCheck);
  }

  async findById(id: number): Promise<UsageCheck | null> {
    const usageCheck = await prisma.usageCheck.findUnique({
      where: { id },
    });

    if (!usageCheck) return null;

    return this.toEntity(usageCheck);
  }

  async findBySubscription(subscriptionId: number): Promise<UsageCheck[]> {
    const usageChecks = await prisma.usageCheck.findMany({
      where: { subscriptionId },
      orderBy: { periodEnd: 'desc' },
    });

    return usageChecks.map(uc => this.toEntity(uc));
  }

  async findScheduled(): Promise<UsageCheck[]> {
    const now = new Date();
    const usageChecks = await prisma.usageCheck.findMany({
      where: {
        status: 'SCHEDULED',
        sendAt: {
          lte: now,
        },
      },
      orderBy: { sendAt: 'asc' },
    });

    return usageChecks.map(uc => this.toEntity(uc));
  }

  async updateStatus(id: number, status: 'SENT' | 'SCHEDULED'): Promise<UsageCheck> {
    const usageCheck = await prisma.usageCheck.update({
      where: { id },
      data: { status },
    });

    return this.toEntity(usageCheck);
  }

  private toEntity(usageCheck: any): UsageCheck {
    return new UsageCheck({
      id: usageCheck.id,
      slackWorkspaceId: usageCheck.slackWorkspaceId,
      subscriptionId: usageCheck.subscriptionId,
      periodStart: usageCheck.periodStart,
      periodEnd: usageCheck.periodEnd,
      sendAt: usageCheck.sendAt,
      status: usageCheck.status,
      createdAt: usageCheck.createdAt,
    });
  }
}

