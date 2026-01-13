import { prisma } from '@/src/lib/prisma';
import { UsageResponse } from '../entities/UsageResponse';
import type { UsageResponseType } from '../types/enums';

export class UsageResponseRepository {
  async createPending(data: {
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
  }): Promise<UsageResponse> {
    const usageResponse = await prisma.usageResponse.create({
      data: {
        slackWorkspaceId: data.slackWorkspaceId,
        usageCheckId: data.usageCheckId,
        subscriptionId: data.subscriptionId,
        slackUserId: data.slackUserId,
        response: null,
        respondedAt: null,
      },
    });

    return this.toEntity(usageResponse);
  }

  async updateResponse(
    id: number,
    response: UsageResponseType
  ): Promise<UsageResponse> {
    const usageResponse = await prisma.usageResponse.update({
      where: { id },
      data: {
        response,
        respondedAt: new Date(),
      },
    });

    return this.toEntity(usageResponse);
  }

  async findPendingByUsageCheckAndUser(
    usageCheckId: number,
    slackUserId: string
  ): Promise<UsageResponse | null> {
    const response = await prisma.usageResponse.findFirst({
      where: {
        usageCheckId,
        slackUserId,
      },
    });

    if (!response) return null;

    return this.toEntity(response);
  }

  async findPendingByUsageCheck(usageCheckId: number): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: {
        usageCheckId,
        response: null,
      },
    });

    return responses.map(r => this.toEntity(r));
  }

  async findByUsageCheck(usageCheckId: number): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: {
        usageCheckId,
      },
    });

    return responses.map(r => this.toEntity(r));
  }

  private toEntity(response: any): UsageResponse {
    return new UsageResponse({
      id: response.id,
      slackWorkspaceId: response.slackWorkspaceId,
      usageCheckId: response.usageCheckId,
      subscriptionId: response.subscriptionId,
      slackUserId: response.slackUserId,
      response: response.response,
      respondedAt: response.respondedAt
    });
  }
}

