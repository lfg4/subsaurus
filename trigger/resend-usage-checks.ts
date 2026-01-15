import { schedules } from '@trigger.dev/sdk/v3';
import { getReSendUsageCheckService } from '@/src/shared/container';

export const resendUsageChecks = schedules.task({
  id: 'resend-usage-checks',
  cron: '0 18 * * *',
  run: async (payload) => {
    console.log('🦖 Starting resend usage check job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getReSendUsageCheckService();

      const result = await service.execute({ daysBeforeEnd: 3 });

      console.log('✅ Usage check reminders sent successfully', {
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
      console.error('❌ Failed to resend usage checks', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});
