import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { RenewalCycle } from '@/src/types/enums';
import { CreateSubscriptionService, CreateSubscriptionDTO } from '../application/CreateSubscription.service';
import { Money } from '../domain/Money';
import { Subscription } from '../domain/Subscription';
import { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';

describe('CreateSubscriptionService', () => {
  let service: CreateSubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let usageCheckRepository: jest.Mocked<UsageCheckRepository>;
  let settingsRepository: jest.Mocked<SettingsRepository>;

  beforeEach(() => {
    subscriptionRepository = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
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

    service = new CreateSubscriptionService(
      subscriptionRepository,
      usageCheckRepository,
      settingsRepository
    );
  });

  describe('execute', () => {
    it('should create a subscription successfully', async () => {
      const dto: CreateSubscriptionDTO = {
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Netflix',
        price: 15.99,
        currency: 'EUR',
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: '2026-02-01',
        slackUserIds: ['U123', 'U456'],
        projects: ['Marketing'],
        notes: 'Test subscription',
      };

      const mockSubscription = Subscription.create({
        id: 1,
        slackWorkspaceId: dto.slackWorkspaceId,
        createdBySlackUserId: dto.createdBySlackUserId,
        name: dto.name,
        cost: new Money(dto.price, dto.currency),
        renewalCycle: dto.renewalCycle,
        renewalDate: new Date(dto.renewalDate),
        slackUserIds: dto.slackUserIds,
        projects: dto.projects,
        notes: dto.notes,
      });

      subscriptionRepository.save.mockResolvedValue(mockSubscription);
      usageCheckRepository.save.mockResolvedValue(undefined as any);

      const result = await service.execute(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Netflix');
      expect(result.cost.amount).toBe(15.99);
      expect(result.cost.currency).toBe('EUR');
      expect(subscriptionRepository.save).toHaveBeenCalledTimes(1);
      expect(usageCheckRepository.save).toHaveBeenCalledTimes(1);
      expect(settingsRepository.getDaysBeforeRenewal).toHaveBeenCalledWith('WS123');
    });

    it('should throw error if name is empty', async () => {
      const dto: CreateSubscriptionDTO = {
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: '',
        price: 15.99,
        currency: 'EUR',
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: '2026-02-01',
        slackUserIds: ['U123'],
      };

      await expect(service.execute(dto)).rejects.toThrow('Subscription name cannot be empty');
      expect(subscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should create subscription without projects', async () => {
      const dto: CreateSubscriptionDTO = {
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'Spotify',
        price: 9.99,
        currency: 'USD',
        renewalCycle: RenewalCycle.MONTHLY,
        renewalDate: '2026-02-01',
        slackUserIds: ['U123'],
      };

      const mockSubscription = Subscription.create({
        id: 2,
        slackWorkspaceId: dto.slackWorkspaceId,
        createdBySlackUserId: dto.createdBySlackUserId,
        name: dto.name,
        cost: new Money(dto.price, dto.currency),
        renewalCycle: dto.renewalCycle,
        renewalDate: new Date(dto.renewalDate),
        slackUserIds: dto.slackUserIds,
        projects: [],
      });

      subscriptionRepository.save.mockResolvedValue(mockSubscription);
      usageCheckRepository.save.mockResolvedValue(undefined as any);

      const result = await service.execute(dto);

      expect(result.projects).toEqual([]);
    });

    it('should schedule usage check correctly', async () => {
      const dto: CreateSubscriptionDTO = {
        slackWorkspaceId: 'WS123',
        createdBySlackUserId: 'U123',
        name: 'GitHub',
        price: 29,
        currency: 'USD',
        renewalCycle: RenewalCycle.YEARLY,
        renewalDate: '2027-01-15',
        slackUserIds: ['U123'],
      };

      const mockSubscription = Subscription.create({
        id: 3,
        slackWorkspaceId: dto.slackWorkspaceId,
        createdBySlackUserId: dto.createdBySlackUserId,
        name: dto.name,
        cost: new Money(dto.price, dto.currency),
        renewalCycle: dto.renewalCycle,
        renewalDate: new Date(dto.renewalDate),
        slackUserIds: dto.slackUserIds,
      });

      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      await service.execute(dto);

      expect(usageCheckRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: 3,
          slackWorkspaceId: 'WS123',
        })
      );
    });
  });
});