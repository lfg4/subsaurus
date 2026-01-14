import { schedules } from '@trigger.dev/sdk/v3';
import { getSyncSlackUsersService } from '@/src/shared/container';

export const slackUsersGetter = schedules.task({
  id: 'slack-users-getter',
  cron: '0 0 1 * *',
  run: async () => {
    const workspaceId = 'T03FUJM8E';
    console.log('🦖 Starting slack users sync job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getSyncSlackUsersService();

      await service.execute(workspaceId);

      console.log('✅ Slack users sync completed successfully', {
        workspaceId: workspaceId,
      });

      return {
        success: true,
        workspaceId: workspaceId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to sync slack users', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});
