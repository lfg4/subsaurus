import type { UsageResponse } from '../domain/UsageResponse';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';

export class GetUsageResponsesByCheckService {
  constructor(private readonly usageResponseRepository: UsageResponseRepository) {}

  async execute(usageCheckId: number): Promise<UsageResponse[]> {
    return this.usageResponseRepository.findByUsageCheck(usageCheckId);
  }
}

