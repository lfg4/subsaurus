import type { UsageCheck } from '../domain/UsageCheck';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';

export interface EnrichedUsageCheckDTO {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  periodStart: Date;
  periodEnd: Date;
  sendAt: Date;
  status: string;
  responsesCount: number;
}

export class GetEnrichedUsageChecksService {
  constructor(
    private readonly usageCheckRepository: UsageCheckRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usageResponseRepository: UsageResponseRepository
  ) {}

  async execute(subscriptionId?: number, slackWorkspaceId?: string): Promise<EnrichedUsageCheckDTO[]> {
    let usageChecks: UsageCheck[];
    
    if (subscriptionId) {
      usageChecks = await this.usageCheckRepository.findBySubscriptionId(subscriptionId);
    } else {
      usageChecks = await this.usageCheckRepository.findAll(slackWorkspaceId);
    }

    const subscriptions = await this.subscriptionRepository.findAll(slackWorkspaceId);

    const enrichedChecks: EnrichedUsageCheckDTO[] = [];

    for (const check of usageChecks) {
      const subscription = subscriptions.find(s => s.id === check.subscriptionId);
      const responses = await this.usageResponseRepository.findByUsageCheck(check.id);

      enrichedChecks.push({
        id: check.id,
        subscriptionId: check.subscriptionId,
        subscriptionName: subscription?.name || 'Unknown',
        periodStart: check.periodStart,
        periodEnd: check.periodEnd,
        sendAt: check.sendAt,
        status: check.status,
        responsesCount: responses.length,
      });
    }

    return enrichedChecks;
  }
}