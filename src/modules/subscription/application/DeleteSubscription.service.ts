import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { logger } from '@/src/shared/infrastructure/Logger';


export class DeleteSubscriptionService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(id: number): Promise<void> {
    
    const subscription = await this.subscriptionRepository.findById(id);

    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    
    
    await this.subscriptionRepository.delete(id);

    logger.info('Subscription deleted', { id, name: subscription.name });
  }
}

