import { SlackUser } from "../entities/SlackUser";
import { prisma } from "../lib/prisma";

export class SlackUserRepository {
    async create(data: SlackUser) {
        return await prisma.slackUser.create({
            data: {
                slackUserId: data.slackUserId,
                slackWorkspaceId: data.slackWorkspaceId,
                displayName: data.displayName,
                email: data.email,
                avatarUrl: data.avatarUrl,
            }
        });
    }

    async getByWorkspaceId(workspaceId: string) {
        return await prisma.slackUser.findMany({
            where: {
                slackWorkspaceId: workspaceId,
            }
        });
    }

    async delete(id: number) {
        return await prisma.slackUser.delete({
            where: {
                id: id,
            }
        });
    }
}