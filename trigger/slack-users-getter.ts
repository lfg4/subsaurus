import { schedules } from '@trigger.dev/sdk/v3';
import { getSyncSlackUsersService, container } from '@/src/shared/container';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { logger } from '@/src/shared/infrastructure/Logger';

export const slackUsersGetter = schedules.task({
  id: 'slack-users-getter',
  cron: '0 0 1 * *',
  run: async () => {
    logger.info('Starting slack users sync job');

    try {
      const settingsRepository = container.resolve<SettingsRepository>('SettingsRepository');
      const workspaceIds = await settingsRepository.getAllWorkspaceIds();

      if (workspaceIds.length === 0) {
        logger.warn('No workspaces found in settings');
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
          logger.info('Synced users for workspace', { workspaceId });
          synced++;
        } catch (error) {
          logger.error('Failed to sync workspace', { workspaceId, error });
          failed++;
        }
      }

      logger.info('Slack users sync completed', {
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
      logger.error('Failed to sync slack users', { error });
      throw error;
    }
  },
});
