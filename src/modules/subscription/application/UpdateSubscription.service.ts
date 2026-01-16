import type { Subscription } from '../domain/Subscription';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';

export interface UpdateSubscriptionDTO {
  name?: string;
  renewalCycle?: RenewalCycle;
  renewalDate?: Date;
  price?: number;
  currency?: string;
  projects?: string[];
  slackUserIds?: string[];
  notes?: string;
}


export class UpdateSubscriptionService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(id: number, data: UpdateSubscriptionDTO): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(id);

    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    if (data.name !== undefined) {
      subscription.updateName(data.name);
    }

    if (data.renewalCycle !== undefined) {
      subscription.updateRenewalCycle(data.renewalCycle);
    }

    if (data.renewalDate !== undefined) {
      subscription.updateRenewalDate(data.renewalDate);
    }

    if (data.price !== undefined && data.currency !== undefined) {
      const cost = new Money(data.price, data.currency);
      subscription.updateCost(cost);
    }

    if (data.projects !== undefined) {
      subscription.updateProjects(data.projects);
    }

    if (data.notes !== undefined) {
      subscription.updateNotes(data.notes);
    }

    if (data.slackUserIds !== undefined) {
      subscription.updateUsers(data.slackUserIds);
      await this.subscriptionRepository.updateUsersInDatabase(
        id,
        subscription.slackWorkspaceId,
        data.slackUserIds
      );
    }

    await this.subscriptionRepository.update(subscription);

    return subscription;
  }
}

