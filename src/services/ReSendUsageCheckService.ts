import type { UsageCheckRepository } from '../repositories/UsageCheckRepository';
import type { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import type { UsageResponseRepository } from '../repositories/UsageResponseRepository';
import type { SlackService } from './SlackService';
import { SlackFactory } from '../factories/SlackFactory';
import { UsageCheckStatus } from '../types/enums';

export class ReSendUsageCheckService {
  constructor(
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly slackService: SlackService
  ) {}

  async run(): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      const checksNeedingReminder = await this.usageCheckRepository.findNeedingReminder(3);

      console.log(`📋 Found ${checksNeedingReminder.length} usage checks needing reminders`);

      for (const check of checksNeedingReminder) {
        try {
          const subscription = await this.subscriptionRepository.findById(
            check.subscriptionId
          );

          if (!subscription) {
            console.error(
              `❌ Subscription ${check.subscriptionId} not found for usage check ${check.id}`
            );
            failed++;
            continue;
          }

          const pendingResponses = await this.usageResponseRepository.findPendingByUsageCheck(
            check.id
          );

          if (pendingResponses.length === 0) {
            console.log(`✅ All users already responded to usage check ${check.id}`);
            continue;
          }

          const usersToRemind = pendingResponses.map(r => r.slackUserId);
          
          console.log(
            `⏰ Sending reminder to ${usersToRemind.length} users for usage check ${check.id}`
          );

          const message = SlackFactory.getUsageCheckMessage(
            check.id,
            subscription.name,
            subscription.renewalCycle
          );

          for (const userId of usersToRemind) {
            try {
              await this.slackService.notifyUsers([userId], message);
              console.log(`📤 Reminder sent to user ${userId}`);
            } catch (error) {
              console.error(`❌ Failed to send reminder to user ${userId}:`, error);
            }
          }
          
          console.log(
            `✅ Reminder for usage check ${check.id} sent to ${usersToRemind.length} users`
          );
          sent++;
        } catch (error) {
          console.error(
            `❌ Error processing usage check ${check.id}:`,
            error
          );
          failed++;
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('❌ Error in ReSendUsageCheckService:', error);
      throw error;
    }
  }
}

