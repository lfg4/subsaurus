import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { UsageCheck } from '@/src/modules/usage-tracking/domain/UsageCheck';


export class RenewSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly settingsRepository: SettingsRepository
  ) {}

  async execute(subscriptionId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    subscription.renew();

    // Get configured days before renewal
    const daysBeforeRenewal = await this.settingsRepository.getDaysBeforeRenewal(subscription.slackWorkspaceId);
    const usageCheckSchedule = subscription.scheduleNextUsageCheck(daysBeforeRenewal);

    await this.subscriptionRepository.update(subscription);

    const usageCheck = UsageCheck.create({
      slackWorkspaceId: subscription.slackWorkspaceId,
      subscriptionId: subscription.id,
      periodStart: usageCheckSchedule.periodStart,
      periodEnd: usageCheckSchedule.periodEnd,
      sendAt: usageCheckSchedule.sendAt,
    });

    await this.usageCheckRepository.save(usageCheck);

    return subscription;
  }
}

