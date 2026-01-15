import { schedules } from '@trigger.dev/sdk/v3';
import { getSendRenewalNotificationService, getSettingsRepository, getSlackUserRepository } from '@/src/shared/container';

export const renewalNotifications = schedules.task({
  id: 'renewal-notifications',
  cron: '0 9 * * *',
  run: async () => {
    console.log('🦖 Starting renewal notification job', {
      timestamp: new Date().toISOString(),
    });

    try {
      const settingsRepository = getSettingsRepository();
      const slackUserRepository = getSlackUserRepository();
      const service = getSendRenewalNotificationService();

      // Get all active workspaces
      const workspaceIds = await settingsRepository.getAllWorkspaceIds();

      if (workspaceIds.length === 0) {
        console.log('ℹ️ No active workspaces found. Skipping renewal notifications.');
        return { success: true, message: 'No workspaces to process' };
      }

      console.log(`📋 Processing renewal notifications for ${workspaceIds.length} workspace(s)`);

      let totalNotified = 0;
      let totalRenewed = 0;
      let totalFailed = 0;

      // Process each workspace
      for (const workspaceId of workspaceIds) {
        try {
          // Find admin users for this workspace
          const adminUsers = await slackUserRepository.findAdminsByWorkspaceId(workspaceId);

          if (adminUsers.length === 0) {
            console.log(`⚠️ No admin user found for workspace ${workspaceId}. Skipping.`);
            continue;
          }

          // Use the first admin found
          const adminUser = adminUsers[0];
          const adminSlackUserId = adminUser.slackUserId;

          console.log(`👤 Using admin ${adminSlackUserId} for workspace ${workspaceId}`);

          const result = await service.execute(adminSlackUserId);

          totalNotified += result.notified || 0;
          totalRenewed += result.renewed;
          totalFailed += result.failed;

          console.log(`✅ Processed workspace ${workspaceId}:`, {
            notified: result.notified,
            renewed: result.renewed,
            failed: result.failed,
          });
        } catch (error) {
          console.error(`❌ Error processing workspace ${workspaceId}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          totalFailed++;
        }
      }

      console.log('✅ Renewal notifications job completed', {
        workspaces: workspaceIds.length,
        notified: totalNotified,
        renewed: totalRenewed,
        failed: totalFailed,
      });

      return {
        success: true,
        workspaces: workspaceIds.length,
        notified: totalNotified,
        renewed: totalRenewed,
        failed: totalFailed,
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
