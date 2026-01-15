import { schedules } from '@trigger.dev/sdk/v3';
import { getReSendUsageCheckService } from '@/src/shared/container';
import { logger } from '@/src/shared/infrastructure/Logger';

export const resendUsageChecks = schedules.task({
  id: 'resend-usage-checks',
  cron: '0 18 * * *',
  run: async (payload) => {
    logger.info('Starting resend usage check job');

    try {
      const service = getReSendUsageCheckService();

      const result = await service.execute({ daysBeforeEnd: 3 });

      logger.info('Usage check reminders sent successfully', {
        sent: result.sent,
        failed: result.failed,
      });

      return {
        success: true,
        sent: result.sent,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to resend usage checks', { error });
      throw error;
    }
  },
});
