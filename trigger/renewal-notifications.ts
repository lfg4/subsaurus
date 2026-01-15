import { schedules } from '@trigger.dev/sdk/v3';
import { getProcessRenewalNotificationsService } from '@/src/shared/container';

export const renewalNotifications = schedules.task({
  id: 'renewal-notifications',
  cron: '0 9 * * *',
  run: async () => {
    console.log('🦖 Starting renewal notification job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getProcessRenewalNotificationsService();
      const result = await service.execute();

      console.log('✅ Renewal notifications job completed', result);

      return result;
    } catch (error) {
      console.error('❌ Failed to send renewal notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});
