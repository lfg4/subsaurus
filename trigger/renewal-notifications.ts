import { schedules } from '@trigger.dev/sdk/v3';
import { getProcessRenewalNotificationsService } from '@/src/shared/container';
import { logger } from '@/src/shared/infrastructure/Logger';

export const renewalNotifications = schedules.task({
  id: 'renewal-notifications',
  cron: '0 9 * * *',
  run: async () => {
    logger.info('Starting renewal notification job');

    try {
      const service = getProcessRenewalNotificationsService();
      const result = await service.execute();

      logger.info('Renewal notifications job completed', {
        workspaces: result.workspaces,
        notified: result.notified,
        renewed: result.renewed,
        failed: result.failed,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send renewal notifications', { error });
      throw error;
    }
  },
});
