import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import { UsageResponseType } from '@/src/types/enums';
import { logger } from '@/src/shared/infrastructure/Logger';


export class RecordUsageResponseService {
  constructor(
    private readonly usageResponseRepository: UsageResponseRepository
  ) {}

  async execute(
    usageCheckId: number,
    slackUserId: string,
    responseType: UsageResponseType
  ): Promise<void> {
    const usageResponse = await this.usageResponseRepository.findPendingByUsageCheckAndUser(
      usageCheckId,
      slackUserId
    );

    if (!usageResponse) {
      throw new Error(
        `Pending response not found for check ${usageCheckId} and user ${slackUserId}`
      );
    }

    usageResponse.recordResponse(responseType);

    await this.usageResponseRepository.update(usageResponse);

    logger.info('User responded to usage check', { slackUserId, responseType, usageCheckId });
  }
}

