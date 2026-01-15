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
}


export class UpdateSubscriptionService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(id: number, data: UpdateSubscriptionDTO): Promise<Subscription> {
    
    const subscription = await this.subscriptionRepository.findById(id);

    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }

    
    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Subscription name cannot be empty');
      }
      updateData.name = data.name;
    }

    if (data.renewalCycle !== undefined) {
      updateData.renewalCycle = data.renewalCycle;
    }

    if (data.renewalDate !== undefined) {
      updateData.renewalDate = data.renewalDate;
    }

    if (data.price !== undefined && data.currency !== undefined) {
      const cost = new Money(data.price, data.currency);
      updateData.costAmount = cost.amount;
      updateData.costCurrency = cost.currency;
    }

    if (data.projects !== undefined) {
      updateData.projects = data.projects;
    }

    
    await this.subscriptionRepository.updateFields(id, updateData);

    
    const updated = await this.subscriptionRepository.findById(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated subscription');
    }

    return updated;
  }
}

