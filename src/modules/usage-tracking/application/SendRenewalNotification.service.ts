import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { RenewSubscriptionService } from '@/src/modules/subscription/application/RenewSubscription.service';
import { UsageResponse } from '../domain/UsageResponse';
import { logger } from '@/src/shared/infrastructure/Logger';


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

      logger.info('Found subscriptions renewing tomorrow', { count: renewingSubscriptions.length });

      if (renewingSubscriptions.length === 0) {
        logger.info('No subscriptions to renew');
        return { notified: 0, renewed: 0, failed: 0 };
      }

      const subscriptionSummaries = [];

      for (const subscription of renewingSubscriptions) {
        try {
          const usageCheck = await this.usageCheckRepository.findBySubscriptionAndPeriod(
            subscription.id,
            subscription.renewalDate
          );

          logger.debug('Processing subscription for renewal', {
            subscriptionId: subscription.id,
            name: subscription.name,
            renewalDate: subscription.renewalDate,
            usageCheckFound: !!usageCheck,
            usageCheckId: usageCheck?.id,
          });

          let responses: UsageResponse[] = [];
          if (usageCheck) {
            responses = await this.usageResponseRepository.findByUsageCheck(usageCheck.id);
            logger.debug('Found responses for usage check', {
              usageCheckId: usageCheck.id,
              totalResponses: responses.length,
              withResponse: responses.filter(r => r.hasResponded()).length,
              pending: responses.filter(r => !r.hasResponded()).length,
            });
          } else {
            logger.warn('No usage check found for subscription', { subscriptionId: subscription.id });
          }

          subscriptionSummaries.push({
            subscription,
            responses,
          });

          await this.renewSubscriptionService.execute(subscription.id);
          renewed++;

          logger.info('Subscription renewed', { subscriptionId: subscription.id });
        } catch (error) {
          logger.error('Error processing subscription for renewal', {
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      const message = this.slackMessageBuilder.buildRenewalNotificationMessage(
        subscriptionSummaries
      );
      await this.slackClient.sendMessage(adminSlackUserId, message);
      notified = 1;

      logger.info('Renewal notification sent to admin', { adminSlackUserId });

      return { notified, renewed, failed };
    } catch (error) {
      logger.error('Error in SendRenewalNotificationService', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

