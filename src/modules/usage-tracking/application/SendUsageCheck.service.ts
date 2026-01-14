import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { UsageResponse } from '../domain/UsageResponse';


export interface SendUsageCheckResult {
  sent: number;
  failed: number;
}

export class SendUsageCheckService {
  constructor(
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly slackClient: SlackClient,
    private readonly slackMessageBuilder: SlackMessageBuilder
  ) {}

  async execute(): Promise<SendUsageCheckResult> {
    let sent = 0;
    let failed = 0;

    try {
      const scheduledChecks = await this.usageCheckRepository.findScheduled();

      console.log(`📋 Found ${scheduledChecks.length} usage checks to send`);

      for (const check of scheduledChecks) {
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

          const message = this.slackMessageBuilder.buildUsageCheckMessage(
            check.id,
            subscription.name,
            subscription.renewalCycle
          );

          for (const userId of subscription.slackUserIds) {
            try {
              await this.slackClient.sendMessage(userId, message);

              const usageResponse = UsageResponse.createPending({
                slackWorkspaceId: check.slackWorkspaceId,
                usageCheckId: check.id,
                subscriptionId: subscription.id,
                slackUserId: userId,
              });

              await this.usageResponseRepository.save(usageResponse);

              console.log(`📤 Message sent and response tracked for user ${userId}`);
            } catch (error) {
              console.error(`❌ Failed to send to user ${userId}:`, error);
            }
          }

          check.markAsSent();
          await this.usageCheckRepository.update(check);

          console.log(
            `✅ Usage check ${check.id} sent to ${subscription.slackUserIds.length} users`
          );
          sent++;
        } catch (error) {
          console.error(`❌ Error processing usage check ${check.id}:`, error);
          failed++;
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('❌ Error in SendUsageCheckService:', error);
      throw error;
    }
  }
}

