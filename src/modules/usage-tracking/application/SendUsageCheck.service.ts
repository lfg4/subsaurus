import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { UsageResponse } from '../domain/UsageResponse';
import { logger } from '@/src/shared/infrastructure/Logger';


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

      logger.info('Found usage checks to send', { count: scheduledChecks.length });

      for (const check of scheduledChecks) {
        try {
          const subscription = await this.subscriptionRepository.findById(
            check.subscriptionId
          );

          if (!subscription) {
            logger.error('Subscription not found for usage check', {
              subscriptionId: check.subscriptionId,
              checkId: check.id,
            });
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

              logger.debug('Message sent and response tracked', { userId });
            } catch (error) {
              logger.error('Failed to send to user', {
                userId,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          check.markAsSent();
          await this.usageCheckRepository.update(check);

          logger.info('Usage check sent', {
            checkId: check.id,
            userCount: subscription.slackUserIds.length,
          });
          sent++;
        } catch (error) {
          logger.error('Error processing usage check', {
            checkId: check.id,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      return { sent, failed };
    } catch (error) {
      logger.error('Error in SendUsageCheckService', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

