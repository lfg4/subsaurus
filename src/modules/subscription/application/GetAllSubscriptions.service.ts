import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

export class GetAllSubscriptionsService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(slackWorkspaceId?: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll(slackWorkspaceId);
  }
}

