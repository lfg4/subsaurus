import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { logger } from '@/src/shared/infrastructure/Logger';

/**
 * Application Service: Delete Subscription Use Case
 * Deletes a subscription (cascade deletes related data via DB constraints)
 */
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

