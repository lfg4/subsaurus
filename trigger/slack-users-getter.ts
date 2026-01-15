import { schedules } from '@trigger.dev/sdk/v3';
import { getSyncSlackUsersService, container } from '@/src/shared/container';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';

export const slackUsersGetter = schedules.task({
  id: 'slack-users-getter',
  cron: '0 0 1 * *',
  run: async () => {
    console.log('🦖 Starting slack users sync job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const settingsRepository = container.resolve<SettingsRepository>('SettingsRepository');
      const workspaceIds = await settingsRepository.getAllWorkspaceIds();

      if (workspaceIds.length === 0) {
        console.log('⚠️ No workspaces found in settings');
        return {
          success: true,
          workspaces: 0,
          timestamp: new Date().toISOString(),
        };
      }

      const service = getSyncSlackUsersService();
      let synced = 0;
      let failed = 0;

      for (const workspaceId of workspaceIds) {
        try {
          await service.execute(workspaceId);
          console.log(`✅ Synced users for workspace ${workspaceId}`);
          synced++;
        } catch (error) {
          console.error(`❌ Failed to sync workspace ${workspaceId}:`, error);
          failed++;
        }
      }

      console.log('✅ Slack users sync completed', {
        synced,
        failed,
        total: workspaceIds.length,
      });

      return {
        success: true,
        synced,
        failed,
        total: workspaceIds.length,
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
