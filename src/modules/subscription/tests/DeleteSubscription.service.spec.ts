import { DeleteSubscriptionService } from '../application/DeleteSubscription.service';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';

describe('DeleteSubscriptionService', () => {
  let service: DeleteSubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findRenewingTomorrow: jest.fn(),
      updateUsersInDatabase: jest.fn(),
    } as any;

    service = new DeleteSubscriptionService(subscriptionRepository);
  });

  describe('execute', () => {
    it('should delete existing subscription', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'To Delete',
        cost: new Money(10, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);
      subscriptionRepository.delete.mockResolvedValue(undefined);

      await service.execute(1);

      expect(subscriptionRepository.findById).toHaveBeenCalledWith(1);
      expect(subscriptionRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if subscription not found', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      await expect(service.execute(999)).rejects.toThrow(
        'Subscription with ID 999 not found'
      );
      expect(subscriptionRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'To Delete',
        cost: new Money(10, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);
      subscriptionRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.execute(1)).rejects.toThrow('Database error');
    });
  });
});

