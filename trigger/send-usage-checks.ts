import { schedules } from '@trigger.dev/sdk/v3';
import { getSendUsageCheckService } from '@/src/shared/container';

export const sendUsageChecks = schedules.task({
  id: 'send-usage-checks',
  cron: '0 10 * * *',
  run: async (payload) => {
    console.log('🦖 Starting usage check job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getSendUsageCheckService();

      const result = await service.execute();

      console.log('✅ Usage checks sent successfully', {
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
      console.error('❌ Failed to send usage checks', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});
