import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';


export class GetSubscriptionsService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async findById(id: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }

  async findRenewingTomorrow(): Promise<Subscription[]> {
    return this.subscriptionRepository.findRenewingTomorrow();
  }

}

