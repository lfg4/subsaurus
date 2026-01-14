export class SlackUser {
    id: number;
    slackUserId: string;
    slackWorkspaceId: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    createdAt: Date;

    constructor(data: {
        id?: number;
        slackUserId: string;
        slackWorkspaceId: string;
        displayName: string | null;
        email: string | null;
        avatarUrl: string | null;
        createdAt?: Date;
    }) {
        this.id = data.id ?? 0;
        this.slackUserId = data.slackUserId;
        this.slackWorkspaceId = data.slackWorkspaceId;
        this.displayName = data.displayName;
        this.email = data.email;
        this.avatarUrl = data.avatarUrl;
        this.createdAt = data.createdAt ?? new Date();
    }

    
}