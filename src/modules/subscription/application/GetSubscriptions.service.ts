import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';


/**
 * Application Service: Get Subscriptions Query
 * Handles queries for subscriptions
 */
export class GetSubscriptionsService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async findById(id: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll();
  }

  async findRenewingTomorrow(): Promise<Subscription[]> {
    return this.subscriptionRepository.findRenewingTomorrow();
  }
}

