import { SlackUser } from "../entities/SlackUser";
import type { SlackUserRepository } from "../repositories/SlackUserRepository";

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

export class SlackUsersGetterService {
    private slackToken: string;
    constructor(private readonly slackUserRepository: SlackUserRepository) {
        this.slackToken = process.env.SLACK_BOT_TOKEN || '';
        if (!this.slackToken) {
            console.error('❌ SLACK_BOT_TOKEN not configured');
            throw new Error('Slack bot token not configured');
        }
    }

    async run(workspaceId: string) {
        try {
            const response = await fetch('https://slack.com/api/users.list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.slackToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
            
            if (!result.ok) {
                console.error('❌ Error getting slack users:', result.error);
                throw new Error(`Slack API error: ${result.error}`);
            }
    
            const activeUsers: SlackApiUser[] = result.members.filter((user: SlackApiUser) => 
                !user.deleted && 
                !user.is_bot && 
                user.id !== 'USLACKBOT'
            );
            const users = await this.slackUserRepository.getByWorkspaceId(workspaceId);

            const newUsers = activeUsers.filter((user: SlackApiUser) => !users.some((u: SlackUser) => u.slackUserId === user.id));
            const deletedUsers = users.filter((user: SlackUser) => !activeUsers.some((u: SlackApiUser) => u.id === user.slackUserId));

            for (const apiUser of newUsers) {
                const slackUser = new SlackUser({
                    slackUserId: apiUser.id,
                    slackWorkspaceId: workspaceId,
                    displayName: apiUser.profile?.display_name || apiUser.profile?.real_name || null,
                    email: apiUser.profile?.email || null,
                    avatarUrl: apiUser.profile?.image_192 || null
                });
                await this.slackUserRepository.create(slackUser);
            }

            for (const user of deletedUsers) {
                await this.slackUserRepository.delete(user.id);
            }
            
        } catch (error) {
            console.error('❌ Error getting slack users:', JSON.stringify(error));
            throw error;
        }
    }
}