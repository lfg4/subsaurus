import { schedules } from '@trigger.dev/sdk/v3';
import { getSendUsageCheckService } from '@/src/shared/container';
import { logger } from '@/src/shared/infrastructure/Logger';

export const sendUsageChecks = schedules.task({
  id: 'send-usage-checks',
  cron: '0 10 * * *',
  run: async (payload) => {
    logger.info('Starting usage check job');

    try {
      const service = getSendUsageCheckService();

      const result = await service.execute();

      logger.info('Usage checks sent successfully', {
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
      logger.error('Failed to send usage checks', { error });
      throw error;
    }
  },
});
