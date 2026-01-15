import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { UsageCheck } from '@/src/modules/usage-tracking/domain/UsageCheck';
import { RenewalCycle } from '@/src/types/enums';


export interface CreateSubscriptionDTO {
  slackWorkspaceId: string;
  createdBySlackUserId: string;
  name: string;
  price: number;
  currency: string;
  renewalCycle: RenewalCycle;
  renewalDate: string;
  slackUserIds: string[];
  projects?: string[];
}

export class CreateSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(data: CreateSubscriptionDTO): Promise<Subscription> {
    const cost = new Money(data.price, data.currency);

    const subscription = Subscription.create({
      slackWorkspaceId: data.slackWorkspaceId,
      createdBySlackUserId: data.createdBySlackUserId,
      name: data.name,
      cost,
      renewalCycle: data.renewalCycle,
      renewalDate: new Date(data.renewalDate),
      slackUserIds: data.slackUserIds,
      projects: data.projects,
    });

    const daysBeforeRenewal = await this.settingsRepository.getDaysBeforeRenewal(data.slackWorkspaceId);
    const usageCheckSchedule = subscription.scheduleNextUsageCheck(daysBeforeRenewal);

    const savedSubscription = await this.subscriptionRepository.save(subscription, data.slackUserIds);

    const usageCheck = UsageCheck.create({
      slackWorkspaceId: data.slackWorkspaceId,
      subscriptionId: savedSubscription.id,
      periodStart: usageCheckSchedule.periodStart,
      periodEnd: usageCheckSchedule.periodEnd,
      sendAt: usageCheckSchedule.sendAt,
    });

    await this.usageCheckRepository.save(usageCheck);

    return savedSubscription;
  }
}

