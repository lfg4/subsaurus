import type { UsageCheck } from '../domain/UsageCheck';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';

/**
 * Application Service: Get Usage Checks Query
 * Handles queries for usage checks
 */
export class GetUsageChecksService {
  constructor(private readonly usageCheckRepository: UsageCheckRepository) {}

  async findAll(): Promise<UsageCheck[]> {
    return this.usageCheckRepository.findAll();
  }

  async findById(id: number): Promise<UsageCheck | null> {
    return this.usageCheckRepository.findById(id);
  }

  async findBySubscriptionId(subscriptionId: number): Promise<UsageCheck[]> {
    return this.usageCheckRepository.findBySubscriptionId(subscriptionId);
  }
}

