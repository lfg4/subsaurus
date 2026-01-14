import { prisma } from '@/src/lib/prisma';
import { UsageResponse } from '../domain/UsageResponse';


export class UsageResponseRepository {
  async save(usageResponse: UsageResponse): Promise<void> {
    const primitives = usageResponse.toPrimitives();

    await prisma.usageResponse.create({
      data: {
        slackWorkspaceId: primitives.slackWorkspaceId,
        usageCheckId: primitives.usageCheckId,
        subscriptionId: primitives.subscriptionId,
        slackUserId: primitives.slackUserId,
        response: primitives.response,
        respondedAt: primitives.respondedAt,
      },
    });
  }

  async update(usageResponse: UsageResponse): Promise<void> {
    const primitives = usageResponse.toPrimitives();

    await prisma.usageResponse.update({
      where: { id: primitives.id },
      data: {
        response: primitives.response,
        respondedAt: primitives.respondedAt,
      },
    });
  }

  async findPendingByUsageCheckAndUser(
    usageCheckId: number,
    slackUserId: string
  ): Promise<UsageResponse | null> {
    const responseData = await prisma.usageResponse.findFirst({
      where: {
        usageCheckId,
        slackUserId,
        response: null,
      },
    });

    if (!responseData) return null;

    return this.toDomain(responseData);
  }

  async findByUsageCheck(usageCheckId: number): Promise<UsageResponse[]> {
    const responses = await prisma.usageResponse.findMany({
      where: {
        usageCheckId,
      },
    });

    return responses.map(r => this.toDomain(r));
  }

  private toDomain(data: any): UsageResponse {
    return UsageResponse.fromPrimitives({
      id: data.id,
      slackWorkspaceId: data.slackWorkspaceId,
      usageCheckId: data.usageCheckId,
      subscriptionId: data.subscriptionId,
      slackUserId: data.slackUserId,
      response: data.response,
      respondedAt: data.respondedAt,
      createdAt: data.createdAt,
    });
  }
}

