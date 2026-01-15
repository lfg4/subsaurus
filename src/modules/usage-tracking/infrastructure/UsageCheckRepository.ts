import { prisma } from '@/src/lib/prisma';
import { UsageCheck } from '../domain/UsageCheck';
import { UsageCheckStatus } from '@/src/types/enums';

export class UsageCheckRepository {
  async save(usageCheck: UsageCheck): Promise<void> {
    const primitives = usageCheck.toPrimitives();

    await prisma.usageCheck.create({
      data: {
        slackWorkspaceId: primitives.slackWorkspaceId,
        subscriptionId: primitives.subscriptionId,
        periodStart: primitives.periodStart,
        periodEnd: primitives.periodEnd,
        sendAt: primitives.sendAt,
        status: primitives.status,
      },
    });
  }

  async update(usageCheck: UsageCheck): Promise<void> {
    const primitives = usageCheck.toPrimitives();

    await prisma.usageCheck.update({
      where: { id: primitives.id },
      data: {
        status: primitives.status,
      },
    });
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

    return usageChecks.map(uc => this.toDomain(uc));
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

    return usageChecks.map(uc => this.toDomain(uc));
  }

  async findById(id: number): Promise<UsageCheck | null> {
    const usageCheck = await prisma.usageCheck.findUnique({
      where: { id },
    });

    if (!usageCheck) return null;

    return this.toDomain(usageCheck);
  }

  async findAll(slackWorkspaceId?: string): Promise<UsageCheck[]> {
    const usageChecks = await prisma.usageCheck.findMany({
      where: slackWorkspaceId ? { slackWorkspaceId } : undefined,
      orderBy: { sendAt: 'desc' },
    });

    return usageChecks.map(uc => this.toDomain(uc));
  }

  async findBySubscriptionId(subscriptionId: number): Promise<UsageCheck[]> {
    const usageChecks = await prisma.usageCheck.findMany({
      where: { subscriptionId },
      orderBy: { sendAt: 'desc' },
    });

    return usageChecks.map(uc => this.toDomain(uc));
  }

  async findBySubscriptionAndPeriod(
    subscriptionId: number,
    periodEnd: Date
  ): Promise<UsageCheck | null> {
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

    return this.toDomain(usageCheck);
  }

  private toDomain(data: any): UsageCheck {
    return UsageCheck.fromPrimitives({
      id: data.id,
      slackWorkspaceId: data.slackWorkspaceId,
      subscriptionId: data.subscriptionId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      sendAt: data.sendAt,
      status: data.status,
      createdAt: data.createdAt,
    });
  }
}

