import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { RenewSubscriptionService } from '@/src/modules/subscription/application/RenewSubscription.service';
import { UsageResponse } from '../domain/UsageResponse';


export interface SendRenewalNotificationResult {
  notified: number;
  renewed: number;
  failed: number;
}

export class SendRenewalNotificationService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly renewSubscriptionService: RenewSubscriptionService,
    private readonly slackClient: SlackClient,
    private readonly slackMessageBuilder: SlackMessageBuilder
  ) {}

  async execute(adminSlackUserId: string): Promise<SendRenewalNotificationResult> {
    let notified = 0;
    let renewed = 0;
    let failed = 0;

    try {
      const renewingSubscriptions = await this.subscriptionRepository.findRenewingTomorrow();

      console.log(`📋 Found ${renewingSubscriptions.length} subscriptions renewing tomorrow`);

      if (renewingSubscriptions.length === 0) {
        console.log('✅ No subscriptions to renew');
        return { notified: 0, renewed: 0, failed: 0 };
      }

      const subscriptionSummaries = [];

      for (const subscription of renewingSubscriptions) {
        try {
          const usageCheck = await this.usageCheckRepository.findBySubscriptionAndPeriod(
            subscription.id,
            subscription.renewalDate
          );

          console.log(`🔍 Subscription ${subscription.id} (${subscription.name}):`, {
            renewalDate: subscription.renewalDate,
            usageCheckFound: !!usageCheck,
            usageCheckId: usageCheck?.id,
          });

          let responses: UsageResponse[] = [];
          if (usageCheck) {
            responses = await this.usageResponseRepository.findByUsageCheck(usageCheck.id);
            console.log(`📊 Found ${responses.length} responses for usage check ${usageCheck.id}`, {
              withResponse: responses.filter(r => r.hasResponded()).length,
              pending: responses.filter(r => !r.hasResponded()).length,
            });
          } else {
            console.log(`⚠️ No usage check found for subscription ${subscription.id}`);
          }

          subscriptionSummaries.push({
            subscription,
            responses,
          });

          await this.renewSubscriptionService.execute(subscription.id);
          renewed++;

          console.log(`✅ Renewed subscription ${subscription.id}`);
        } catch (error) {
          console.error(`❌ Error processing subscription ${subscription.id}:`, error);
          failed++;
        }
      }

      const message = this.slackMessageBuilder.buildRenewalNotificationMessage(
        subscriptionSummaries
      );
      await this.slackClient.sendMessage(adminSlackUserId, message);
      notified = 1;

      console.log(`✅ Renewal notification sent to admin`);

      return { notified, renewed, failed };
    } catch (error) {
      console.error('❌ Error in SendRenewalNotificationService:', error);
      throw error;
    }
  }
}

