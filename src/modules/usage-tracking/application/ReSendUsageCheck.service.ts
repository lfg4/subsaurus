import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';


export interface ReSendUsageCheckResult {
  sent: number;
  failed: number;
}


export class ReSendUsageCheckService {
  constructor(
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly slackClient: SlackClient,
    private readonly slackMessageBuilder: SlackMessageBuilder
  ) {}

  async execute(daysBeforeEnd: number = 3): Promise<ReSendUsageCheckResult> {
    let sent = 0;
    let failed = 0;

    try {
      const checksNeedingReminder = await this.usageCheckRepository.findNeedingReminder(
        daysBeforeEnd
      );

      console.log(`📋 Found ${checksNeedingReminder.length} usage checks needing reminder`);

      for (const check of checksNeedingReminder) {
        try {
          const subscription = await this.subscriptionRepository.findById(
            check.subscriptionId
          );

          if (!subscription) {
            console.error(`❌ Subscription ${check.subscriptionId} not found`);
            failed++;
            continue;
          }

          const responses = await this.usageResponseRepository.findByUsageCheck(check.id);

          const respondedUserIds = responses
            .filter(r => r.hasResponded())
            .map(r => r.slackUserId);

          const pendingUserIds = subscription.slackUserIds.filter(
            userId => !respondedUserIds.includes(userId)
          );

          if (pendingUserIds.length === 0) {
            console.log(`✅ All users responded for usage check ${check.id}`);
            continue;
          }

          const message = this.slackMessageBuilder.buildUsageCheckMessage(
            check.id,
            subscription.name,
            subscription.renewalCycle
          );

          for (const userId of pendingUserIds) {
            try {
              await this.slackClient.sendMessage(userId, message);
              console.log(`📤 Reminder sent to user ${userId}`);
            } catch (error) {
              console.error(`❌ Failed to resend to user ${userId}:`, error);
            }
          }

          sent++;
          console.log(
            `✅ Reminder sent for usage check ${check.id} to ${pendingUserIds.length} users`
          );
        } catch (error) {
          console.error(`❌ Error processing reminder for check ${check.id}:`, error);
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

