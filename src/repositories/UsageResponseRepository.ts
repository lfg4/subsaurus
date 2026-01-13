import { prisma } from '@/src/lib/prisma';
import { UsageResponse } from '../entities/UsageResponse';

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
    response: 'YES' | 'NO' | 'LITTLE'
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

  async findByUsageCheck(usageCheckId: number): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: { usageCheckId },
      orderBy: { respondedAt: 'asc' },
    });

    return responses.map(r => this.toEntity(r));
  }

  async findBySubscription(subscriptionId: number): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: { subscriptionId },
      orderBy: { respondedAt: 'desc' },
    });

    return responses.map(r => this.toEntity(r));
  }

  async findByUser(slackUserId: string): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: { slackUserId },
      orderBy: { respondedAt: 'desc' },
    });

    return responses.map(r => this.toEntity(r));
  }

  async hasUserResponded(usageCheckId: number, slackUserId: string): Promise<boolean> {
    const response = await prisma.usageResponse.findFirst({
      where: {
        usageCheckId,
        slackUserId,
      },
    });

    return response !== null;
  }

  async getResponsesSummary(usageCheckId: number): Promise<{
    yes: number;
    no: number;
    little: number;
    total: number;
  }> {
    const responses = await this.findByUsageCheck(usageCheckId);

    return {
      yes: responses.filter(r => r.isPositive()).length,
      no: responses.filter(r => r.isNegative()).length,
      little: responses.filter(r => r.isLittle()).length,
      total: responses.length,
    };
  }

  private toEntity(response: any): UsageResponse {
    return new UsageResponse({
      id: response.id,
      slackWorkspaceId: response.slackWorkspaceId,
      usageCheckId: response.usageCheckId,
      subscriptionId: response.subscriptionId,
      slackUserId: response.slackUserId,
      response: response.response,
      respondedAt: response.respondedAt,
      createdAt: response.createdAt,
    });
  }
}

