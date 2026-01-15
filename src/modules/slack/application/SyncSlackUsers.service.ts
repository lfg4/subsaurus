import type { SlackUserRepository } from '../infrastructure/SlackUserRepository';
import type { SlackClient } from '../infrastructure/SlackClient';
import { SlackUser } from '../domain/SlackUser';

interface SlackApiUser {
  id: string;
  deleted?: boolean;
  is_bot?: boolean;
  profile?: {
    display_name?: string;
    real_name?: string;
    email?: string;
    image_192?: string;
  };
  team_id?: string;
}

export class SyncSlackUsersService {
  private slackToken: string;

  constructor(private readonly slackUserRepository: SlackUserRepository) {
    this.slackToken = process.env.SLACK_BOT_TOKEN || '';
    if (!this.slackToken) {
      console.error('❌ SLACK_BOT_TOKEN not configured');
      throw new Error('Slack bot token not configured');
    }
  }

  async execute(workspaceId: string): Promise<void> {
    try {
      const response = await fetch('https://slack.com/api/users.list',
        {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.slackToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.ok) {
        console.error('❌ Error getting slack users:', result.error);
        throw new Error(`Slack API error: ${result.error}`);
      }

      const activeUsers: SlackApiUser[] = result.members.filter(
        (user: SlackApiUser) =>
          !user.deleted && !user.is_bot && user.id !== 'USLACKBOT'
      );

      const existingUsers = await this.slackUserRepository.findByWorkspaceId(workspaceId);

      const newUsers = activeUsers.filter(
        (apiUser: SlackApiUser) =>
          !existingUsers.some(u => u.slackUserId === apiUser.id)
      );

      const deletedUsers = existingUsers.filter(
        user => !activeUsers.some((apiUser: SlackApiUser) => apiUser.id === user.slackUserId)
      );

      for (const apiUser of newUsers) {
        const slackUser = SlackUser.create({
          slackUserId: apiUser.id,
          slackWorkspaceId: workspaceId,
          displayName: apiUser.profile?.display_name || apiUser.profile?.real_name || null,
          email: apiUser.profile?.email || null,
          avatarUrl: apiUser.profile?.image_192 || null,
        });
        await this.slackUserRepository.save(slackUser);
      }

      for (const user of deletedUsers) {
        await this.slackUserRepository.delete(user.id);
      }

      console.log(`✅ Synced ${newUsers.length} new users, removed ${deletedUsers.length} users`);
    } catch (error) {
      console.error('❌ Error syncing slack users:', JSON.stringify(error));
      throw error;
    }
  }
}

