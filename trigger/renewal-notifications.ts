import { schedules } from '@trigger.dev/sdk/v3';
import { getSendRenewalNotificationService } from '@/src/shared/container';

export const renewalNotifications = schedules.task({
  id: 'renewal-notifications',
  cron: '0 9 * * *',
  run: async (payload) => {
    console.log('🦖 Starting renewal notification job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getSendRenewalNotificationService();

      const adminSlackUserId = process.env.ADMIN_SLACK_USER_ID || 'U06TW9RS29H';

      const result = await service.execute(adminSlackUserId);

      console.log('✅ Renewal notifications sent successfully', {
        notified: result.notified,
        renewed: result.renewed,
        failed: result.failed,
      });

      return {
        success: true,
        notified: result.notified,
        renewed: result.renewed,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to send renewal notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});
