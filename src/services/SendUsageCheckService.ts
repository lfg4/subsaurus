import type { UsageCheckRepository } from '../repositories/UsageCheckRepository';
import type { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import type { UsageResponseRepository } from '../repositories/UsageResponseRepository';
import type { SlackService } from './SlackService';
import { SlackFactory } from '../factories/SlackFactory';

export class SendUsageCheckService {
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

          const message = SlackFactory.getUsageCheckMessage(
            check.id,
            subscription.name,
            subscription.renewalCycle as 'MONTHLY' | 'YEARLY' | 'CUSTOM'
          );

          for (const userId of subscription.slackUserIds) {
            try {
              await this.slackService.notifyUsers([userId], message);
              
              await this.usageResponseRepository.createPending({
                slackWorkspaceId: check.slackWorkspaceId,
                usageCheckId: check.id,
                subscriptionId: subscription.id,
                slackUserId: userId,
              });
              
              console.log(`📤 Message sent and response tracked for user ${userId}`);
            } catch (error) {
              console.error(`❌ Failed to send to user ${userId}:`, error);
            }
          }

          await this.usageCheckRepository.updateStatus(check.id, 'SENT');
          
          console.log(
            `✅ Usage check ${check.id} sent to ${subscription.slackUserIds.length} users`
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
      console.error('❌ Error in SendUsageCheckService:', error);
      throw error;
    }
  }
}

