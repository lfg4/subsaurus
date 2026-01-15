import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import type { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { logger } from '@/src/shared/infrastructure/Logger';


export interface ReSendUsageCheckResult {
  success: boolean;
  sent: number;
  failed: number;
  total?: number;
  message?: string;
}

export interface ReSendUsageCheckParams {
  checkId?: number;
  daysBeforeEnd?: number;
}


export class ReSendUsageCheckService {
  constructor(
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageResponseRepository: UsageResponseRepository,
    private readonly slackClient: SlackClient,
    private readonly slackMessageBuilder: SlackMessageBuilder
  ) {}

  async execute(params?: ReSendUsageCheckParams): Promise<ReSendUsageCheckResult> {
    // Si se proporciona un checkId específico, procesar solo ese check
    if (params?.checkId) {
      return this.executeForSpecificCheck(params.checkId);
    }

    // Si no, procesar todos los checks que necesitan reminder
    const daysBeforeEnd = params?.daysBeforeEnd ?? 3;
    return this.executeForMultipleChecks(daysBeforeEnd);
  }

  private async executeForSpecificCheck(checkId: number): Promise<ReSendUsageCheckResult> {
    try {
      const check = await this.usageCheckRepository.findById(checkId);

      if (!check) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          message: 'Usage check not found',
        };
      }

      const subscription = await this.subscriptionRepository.findById(check.subscriptionId);

      if (!subscription) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          message: 'Subscription not found',
        };
      }

      const responses = await this.usageResponseRepository.findByUsageCheck(check.id);

      const respondedUserIds = responses
        .filter(r => r.hasResponded())
        .map(r => r.slackUserId);

      const pendingUserIds = subscription.slackUserIds.filter(
        userId => !respondedUserIds.includes(userId)
      );

      if (pendingUserIds.length === 0) {
        return {
          success: true,
          sent: 0,
          failed: 0,
          total: 0,
          message: 'All users have already responded',
        };
      }

      const message = this.slackMessageBuilder.buildUsageCheckMessage(
        check.id,
        subscription.name,
        subscription.renewalCycle
      );

      let sent = 0;
      let failed = 0;

      for (const userId of pendingUserIds) {
        try {
          await this.slackClient.sendMessage(userId, message);
          logger.debug('Reminder sent to user', { userId, checkId });
          sent++;
        } catch (error) {
          logger.error('Failed to send reminder to user', {
            userId,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      return {
        success: true,
        sent,
        failed,
        total: pendingUserIds.length,
        message: 'Reminders sent successfully',
      };
    } catch (error) {
      logger.error('Error processing check', {
        checkId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async executeForMultipleChecks(daysBeforeEnd: number): Promise<ReSendUsageCheckResult> {
    let sent = 0;
    let failed = 0;

    try {
      const checksNeedingReminder = await this.usageCheckRepository.findNeedingReminder(
        daysBeforeEnd
      );

      logger.info('Found usage checks needing reminder', { count: checksNeedingReminder.length });

      for (const check of checksNeedingReminder) {
        try {
          const subscription = await this.subscriptionRepository.findById(
            check.subscriptionId
          );

          if (!subscription) {
            logger.error('Subscription not found', { subscriptionId: check.subscriptionId });
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
            logger.debug('All users responded for usage check', { checkId: check.id });
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
              logger.debug('Reminder sent to user', { userId });
            } catch (error) {
              logger.error('Failed to resend to user', {
                userId,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          sent++;
          logger.info('Reminder sent for usage check', {
            checkId: check.id,
            userCount: pendingUserIds.length,
          });
        } catch (error) {
          logger.error('Error processing reminder for check', {
            checkId: check.id,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      return { success: true, sent, failed };
    } catch (error) {
      logger.error('Error in ReSendUsageCheckService', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

