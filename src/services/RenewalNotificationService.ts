import type { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import type { UsageCheckRepository } from '../repositories/UsageCheckRepository';
import type { UsageResponseRepository } from '../repositories/UsageResponseRepository';
import type { SlackService } from './SlackService';
import { SlackFactory } from '../factories/SlackFactory';
import { RenewalCycle } from '../types/enums';

export class RenewalNotificationService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly slackService: SlackService
  ) {}

  async run(adminSlackUserId: string): Promise<{ notified: number; updated: number; failed: number }> {
    let notified = 0;
    let updated = 0;
    let failed = 0;

    try {
      const renewingSubscriptions = await this.subscriptionRepository.findRenewingTomorrow();

      console.log(`📋 Found ${renewingSubscriptions.length} subscriptions renewing tomorrow`);

      if (renewingSubscriptions.length === 0) {
        console.log('✅ No subscriptions to renew');
        return { notified: 0, updated: 0, failed: 0 };
      }

      const subscriptionSummaries = [];

      for (const subscription of renewingSubscriptions) {
        try {
          const usageCheck = await this.usageCheckRepository.findBySubscriptionAndPeriod(
            subscription.id,
            subscription.renewalDate
          );

          let responses = [];
          if (usageCheck) {
            responses = await this.usageResponseRepository.findByUsageCheck(usageCheck.id);
          }

          subscriptionSummaries.push({
            subscription,
            responses,
          });

          const newRenewalDate = this.calculateNextRenewalDate(
            subscription.renewalDate,
            subscription.renewalCycle
          );
          await this.subscriptionRepository.updateRenewalDate(subscription.id, newRenewalDate);

          const periodStart = new Date(newRenewalDate);
          if (subscription.renewalCycle === RenewalCycle.MONTHLY) {
            periodStart.setMonth(periodStart.getMonth() - 1);
          } else if (subscription.renewalCycle === RenewalCycle.YEARLY) {
            periodStart.setFullYear(periodStart.getFullYear() - 1);
          } else {
            periodStart.setDate(periodStart.getDate() - 30);
          }

          const sendAt = new Date(newRenewalDate);
          sendAt.setDate(sendAt.getDate() - 7);

          await this.usageCheckRepository.create({
            slackWorkspaceId: subscription.slackWorkspaceId,
            subscriptionId: subscription.id,
            periodStart,
            periodEnd: newRenewalDate,
            sendAt,
          });

          updated++;
          console.log(`✅ Updated subscription ${subscription.id} and created new usage check`);
        } catch (error) {
          console.error(`❌ Error processing subscription ${subscription.id}:`, error);
          failed++;
        }
      }

      const message = SlackFactory.getRenewalNotificationMessage(subscriptionSummaries);
      await this.slackService.notifyUsers([adminSlackUserId], message);
      notified = 1;

      console.log(`✅ Renewal notification sent to admin`);

      return { notified, updated, failed };
    } catch (error) {
      console.error('❌ Error in RenewalNotificationService:', error);
      throw error;
    }
  }

  private calculateNextRenewalDate(currentRenewalDate: Date, renewalCycle: RenewalCycle): Date {
    const nextDate = new Date(currentRenewalDate);

    if (renewalCycle === RenewalCycle.MONTHLY) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (renewalCycle === RenewalCycle.YEARLY) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 30);
    }

    return nextDate;
  }
}

