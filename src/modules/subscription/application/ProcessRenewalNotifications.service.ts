import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import type { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import type { SendRenewalNotificationService } from '@/src/modules/usage-tracking/application/SendRenewalNotification.service';

export interface ProcessRenewalNotificationsResult {
  success: boolean;
  workspaces: number;
  notified: number;
  renewed: number;
  failed: number;
  message?: string;
  timestamp: string;
}


export class ProcessRenewalNotificationsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly slackUserRepository: SlackUserRepository,
    private readonly sendRenewalNotificationService: SendRenewalNotificationService
  ) {}

  async execute(): Promise<ProcessRenewalNotificationsResult> {
    console.log('🦖 Processing renewal notifications for all workspaces');

    const workspaceIds = await this.settingsRepository.getAllWorkspaceIds();

    if (workspaceIds.length === 0) {
      console.log('ℹ️ No active workspaces found');
      return {
        success: true,
        workspaces: 0,
        notified: 0,
        renewed: 0,
        failed: 0,
        message: 'No workspaces to process',
        timestamp: new Date().toISOString(),
      };
    }

    console.log(`📋 Found ${workspaceIds.length} active workspace(s)`);

    let totalNotified = 0;
    let totalRenewed = 0;
    let totalFailed = 0;

    for (const workspaceId of workspaceIds) {
      try {
        const adminSlackUserId = await this.getAdminUserForWorkspace(workspaceId);
        
        console.log(`👤 Processing workspace ${workspaceId} with admin ${adminSlackUserId}`);
        
        const result = await this.sendRenewalNotificationService.execute(adminSlackUserId);
        
        totalNotified += result.notified || 0;
        totalRenewed += result.renewed;
        totalFailed += result.failed;

        console.log(`✅ Workspace ${workspaceId} completed:`, {
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

    return {
      success: true,
      workspaces: workspaceIds.length,
      notified: totalNotified,
      renewed: totalRenewed,
      failed: totalFailed,
      timestamp: new Date().toISOString(),
    };
  }

  private async getAdminUserForWorkspace(workspaceId: string): Promise<string> {
    const adminUsers = await this.slackUserRepository.findAdminsByWorkspaceId(workspaceId);

    if (adminUsers.length === 0) {
      throw new Error(`No admin users found for workspace ${workspaceId}`);
    }

    return adminUsers[0].slackUserId;
  }
}

