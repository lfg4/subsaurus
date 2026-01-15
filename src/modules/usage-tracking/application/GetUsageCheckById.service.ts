import type { UsageCheck } from '../domain/UsageCheck';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';

export class GetUsageCheckByIdService {
  constructor(private readonly usageCheckRepository: UsageCheckRepository) {}

  async execute(id: number): Promise<UsageCheck | null> {
    return this.usageCheckRepository.findById(id);
  }
}

