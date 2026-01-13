import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UsageCheckRepository } from '../repositories/UsageCheckRepository';
import { Subscription } from '../entities/Subscription';
import type { SlackSubscriptionData } from '../types/slack';

export class CreateSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageCheckRepository: UsageCheckRepository
  ) {}

  async run(
    data: SlackSubscriptionData,
    workspaceId: string,
    createdBy: string
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.create(
      data,
      workspaceId,
      createdBy
    );

    const renewalDate = new Date(data.renewalDate);
    const periodEnd = new Date(renewalDate);

    const periodStart = new Date(renewalDate);
    if (data.renewalCycle === 'MONTHLY') {
      periodStart.setMonth(periodStart.getMonth() - 1);
    } else if (data.renewalCycle === 'YEARLY') {
      periodStart.setFullYear(periodStart.getFullYear() - 1);
    } else {
      periodStart.setDate(periodStart.getDate() - 30);
    }

    const sendAt = new Date(periodEnd);
    sendAt.setDate(sendAt.getDate() - 7);

    await this.usageCheckRepository.create({
      slackWorkspaceId: workspaceId,
      subscriptionId: subscription.id,
      periodStart,
      periodEnd,
      sendAt,
    });

    return subscription;
  }
}

