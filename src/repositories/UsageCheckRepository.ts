import { prisma } from '@/src/lib/prisma';
import { UsageCheck } from '../entities/UsageCheck';
import { UsageCheckStatus } from '../types/enums';

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
        status: UsageCheckStatus.SCHEDULED,
      },
    });

    return this.toEntity(usageCheck);
  }

  async findScheduled(): Promise<UsageCheck[]> {
    const now = new Date();
    const usageChecks = await prisma.usageCheck.findMany({
      where: {
        status: UsageCheckStatus.SCHEDULED,
        sendAt: {
          lte: now,
        },
      },
      orderBy: { sendAt: 'asc' },
    });

    return usageChecks.map(uc => this.toEntity(uc));
  }

  async findNeedingReminder(daysBeforeEnd: number = 3): Promise<UsageCheck[]> {
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBeforeEnd);
    
    const usageChecks = await prisma.usageCheck.findMany({
      where: {
        status: UsageCheckStatus.SENT,
        periodEnd: {
          gte: now, 
          lte: reminderDate,
        },
      },
      orderBy: { periodEnd: 'asc' },
    });

    return usageChecks.map(uc => this.toEntity(uc));
  }

  async updateStatus(id: number, status: UsageCheckStatus): Promise<UsageCheck> {
    const usageCheck = await prisma.usageCheck.update({
      where: { id },
      data: { status },
    });

    return this.toEntity(usageCheck);
  }

  async findBySubscriptionAndPeriod(
    subscriptionId: number,
    periodEnd: Date
  ): Promise<UsageCheck | null> {
    // Normalizar la fecha para comparar solo día/mes/año
    const startOfDay = new Date(periodEnd);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(periodEnd);
    endOfDay.setHours(23, 59, 59, 999);

    const usageCheck = await prisma.usageCheck.findFirst({
      where: {
        subscriptionId,
        periodEnd: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!usageCheck) return null;

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

