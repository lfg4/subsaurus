import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

export class GetAllSubscriptionsService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll();
  }
}

