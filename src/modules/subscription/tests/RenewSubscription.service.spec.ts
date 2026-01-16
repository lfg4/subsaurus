import { RenewSubscriptionService } from '../application/RenewSubscription.service';
import { Subscription } from '../domain/Subscription';
import { Money } from '../domain/Money';
import { RenewalCycle } from '@/src/types/enums';
import type { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';

describe('RenewSubscriptionService', () => {
  let service: RenewSubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let usageCheckRepository: jest.Mocked<UsageCheckRepository>;
  let settingsRepository: jest.Mocked<SettingsRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findRenewingTomorrow: jest.fn(),
      updateUsersInDatabase: jest.fn(),
    } as any;

    usageCheckRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findScheduled: jest.fn(),
      findNeedingReminder: jest.fn(),
      findBySubscriptionId: jest.fn(),
      findBySubscriptionAndPeriod: jest.fn(),
    } as any;

    settingsRepository = {
      getDaysBeforeRenewal: jest.fn().mockResolvedValue(7),
      updateDaysBeforeRenewal: jest.fn(),
    } as any;

    service = new RenewSubscriptionService(
      subscriptionRepository,
      usageCheckRepository,
      settingsRepository
    );
  });

  describe('execute', () => {
    it('should renew monthly subscription correctly', async () => {
      const subscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Netflix',
        cost: new Money(15.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-01-15'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(subscription);
      subscriptionRepository.update.mockResolvedValue(undefined);
      usageCheckRepository.save.mockResolvedValue(undefined as any);

      const result = await service.execute(1);

      expect(result).toBeDefined();
      expect(subscriptionRepository.update).toHaveBeenCalled();
      expect(usageCheckRepository.save).toHaveBeenCalled();
    });

    it('should renew yearly subscription correctly', async () => {
      const subscription = Subscription.create({
        id: 2,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'GitHub',
        cost: new Money(99, 'USD'),
        renewalCycle: RenewalCycle.YEARLY,
        renewalDate: new Date('2026-01-15'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(subscription);
      subscriptionRepository.update.mockResolvedValue(undefined);
      usageCheckRepository.save.mockResolvedValue(undefined as any);

      const result = await service.execute(2);

      expect(result).toBeDefined();
    });

    it('should throw error if subscription not found', async () => {
      subscriptionRepository.findById.mockResolvedValue(null);

      await expect(service.execute(999)).rejects.toThrow(
        'Subscription with ID 999 not found'
      );
    });

    it('should create new usage check after renewal', async () => {
      const subscription = Subscription.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Netflix',
        cost: new Money(15.99, 'EUR'),
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: new Date('2026-01-15'),
        slackUserIds: ['U123'],
      });

      subscriptionRepository.findById.mockResolvedValue(subscription);
      subscriptionRepository.update.mockResolvedValue(undefined);
      usageCheckRepository.save.mockResolvedValue(undefined as any);

      await service.execute(1);

      expect(usageCheckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: 1,
          slackWorkspaceId: 'WS123',
        })
      );
    });
  });
});

