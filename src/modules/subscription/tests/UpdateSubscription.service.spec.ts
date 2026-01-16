import { UpdateSubscriptionService, UpdateSubscriptionDTO } from '../application/UpdateSubscription.service';
import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

describe('UpdateSubscriptionService', () => {
  let service: UpdateSubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      updateUsersInDatabase: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findRenewingTomorrow: jest.fn(),
    } as any;

    service = new UpdateSubscriptionService(subscriptionRepository);
  });

  describe('execute', () => {
    it('should update subscription successfully', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Netflix',
        cost: new Money(15.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123'],
        projects: ['Marketing'],
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);

      const updateDTO: UpdateSubscriptionDTO = {
        name: 'Netflix Premium',
        price: 19.99,
        currency: 'EUR',
        projects: ['Marketing', 'Sales'],
      };

      const result = await service.execute(1, updateDTO);

      expect(result.name).toBe('Netflix Premium');
      expect(result.cost.amount).toBe(19.99);
      expect(result.cost.currency).toBe('EUR');
      expect(result.projects).toEqual(['Marketing', 'Sales']);
      expect(subscriptionRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error if subscription not found', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      const updateDTO: UpdateSubscriptionDTO = {
        name: 'Updated Name',
      };

      await expect(service.execute(999, updateDTO)).rejects.toThrow(
        'Subscription with ID 999 not found'
      );
      expect(subscriptionRepository.update).not.toHaveBeenCalled();
    });

    it('should update users and sync with database', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Spotify',
        cost: new Money(9.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);

      const updateDTO: UpdateSubscriptionDTO = {
        slackUserIds: ['U123', 'U456', 'U789'],
      };

      await service.execute(1, updateDTO);

      expect(subscriptionRepository.updateUsersInDatabase).toHaveBeenCalledWith(
        1,
        'WS123',
        ['U123', 'U456', 'U789']
      );
    });

    it('should update only provided fields', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Original Name',
        cost: new Money(10, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123'],
        projects: ['Project A'],
        notes: 'Original notes',
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);

      const updateDTO: UpdateSubscriptionDTO = {
        notes: 'Updated notes only',
      };

      const result = await service.execute(1, updateDTO);

      expect(result.name).toBe('Original Name');
      expect(result.cost.amount).toBe(10);
      expect(result.notes).toBe('Updated notes only');
      expect(result.projects).toEqual(['Project A']);
    });

    it('should allow updating to empty users array', async () => {
      const existingSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Spotify',
        cost: new Money(9.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123', 'U456'],
      });

      subscriptionRepository.findById.mockResolvedValue(existingSubscription);

      const updateDTO: UpdateSubscriptionDTO = {
        slackUserIds: [],
      };

      await service.execute(1, updateDTO);

      expect(subscriptionRepository.updateUsersInDatabase).toHaveBeenCalledWith(
        1,
        'WS123',
        []
      );
    });
  });
});

