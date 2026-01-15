import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

export class GetSubscriptionByIdService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(id: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }
}

