import { GetSubscriptionByIdService } from '../application/GetSubscriptionById.service';
import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

describe('GetSubscriptionByIdService', () => {
  let service: GetSubscriptionByIdService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findRenewingTomorrow: jest.fn(),
      updateUsersInDatabase: jest.fn(),
    } as any;

    service = new GetSubscriptionByIdService(subscriptionRepository);
  });

  describe('execute', () => {
    it('should return subscription when found', async () => {
      const mockSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Netflix',
        cost: new Money(15.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-02-01'),
        slackUserIds: ['U123', 'U456'],
        projects: ['Marketing'],
        notes: 'Premium account',
      });

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);

      const result = await service.execute(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Netflix');
      expect(result?.cost.amount).toBe(15.99);
      expect(subscriptionRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when subscription not found', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      const result = await service.execute(999);

      expect(result).toBeNull();
      expect(subscriptionRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should preserve all subscription properties', async () => {
      const mockSubscription = Subscription.create({
        id: 5,
        slackWorkspaceId: 'WS789',
        createdBySlackUserId: 'U789',
        name: 'GitHub Pro',
        cost: new Money(29, 'USD'),
        renewalCycle: RenewalCycle.YEARLY,
        renewalDate: new Date('2027-01-15'),
        slackUserIds: ['U789', 'U101', 'U102'],
        projects: ['Engineering', 'DevOps'],
        notes: 'Team subscription',
      });

      subscriptionRepository.findById.mockResolvedValue(mockSubscription);

      const result = await service.execute(5);

      expect(result?.slackUserIds).toEqual(['U789', 'U101', 'U102']);
      expect(result?.projects).toEqual(['Engineering', 'DevOps']);
      expect(result?.notes).toBe('Team subscription');
      expect(result?.renewalCycle).toBe(RenewalCycle.YEARLY);
    });
  });
});

