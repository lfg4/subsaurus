import { GetAllSubscriptionsService } from '../application/GetAllSubscriptions.service';
import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

describe('GetAllSubscriptionsService', () => {
  let service: GetAllSubscriptionsService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findRenewingTomorrow: jest.fn(),
      updateUsersInDatabase: jest.fn(),
    } as any;

    service = new GetAllSubscriptionsService(subscriptionRepository);
  });

  describe('execute', () => {
    it('should return all subscriptions when no workspaceId provided', async () => {
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Netflix',
          cost: new Money(15.99, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
        }),
        Subscription.create({
          id: 2,
          slackWorkspaceId: 'WS456',
          createdBySlackUserId: 'U456',
          name: 'Spotify',
          cost: new Money(9.99, 'USD'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-03-01'),
          slackUserIds: ['U456'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Netflix');
      expect(result[1].name).toBe('Spotify');
      expect(subscriptionRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter by workspaceId when provided', async () => {
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Netflix',
          cost: new Money(15.99, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      expect(result).toHaveLength(1);
      expect(result[0].slackWorkspaceId).toBe('WS123');
      expect(subscriptionRepository.findAll).toHaveBeenCalledWith('WS123');
    });

    it('should return empty array when no subscriptions found', async () => {
      subscriptionRepository.findAll.mockResolvedValue([]);

      const result = await service.execute('WS999');

      expect(result).toEqual([]);
      expect(subscriptionRepository.findAll).toHaveBeenCalledWith('WS999');
    });
  });
});

