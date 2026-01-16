import { GetDashboardStatsService } from '../application/GetDashboardStats.service';
import { Subscription } from '@/src/modules/subscription/domain/Subscription';
import { Money } from '@/src/modules/subscription/domain/Money';
import { RenewalCycle } from '@/src/types/enums';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import type { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import type { UsageResponseRepository } from '@/src/modules/usage-tracking/infrastructure/UsageResponseRepository';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import type { ConvertCurrencyTotalsService } from '../application/ConvertCurrencyTotalsService';

describe('GetDashboardStatsService', () => {
  let service: GetDashboardStatsService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let usageCheckRepository: jest.Mocked<UsageCheckRepository>;
  let usageResponseRepository: jest.Mocked<UsageResponseRepository>;
  let settingsRepository: jest.Mocked<SettingsRepository>;
  let convertCurrencyTotalsService: jest.Mocked<ConvertCurrencyTotalsService>;

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

    usageCheckRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findScheduled: jest.fn(),
      findNeedingReminder: jest.fn(),
      findBySubscriptionId: jest.fn().mockResolvedValue([]),
      findBySubscriptionAndPeriod: jest.fn(),
    } as any;

    usageResponseRepository = {
      findById: jest.fn(),
      findByUsageCheck: jest.fn().mockResolvedValue([]),
      findByUser: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    settingsRepository = {
      findByWorkspace: jest.fn(),
      upsert: jest.fn(),
      getDaysBeforeRenewal: jest.fn(),
      getPreferredCurrency: jest.fn().mockResolvedValue('EUR'),
      getAllWorkspaceIds: jest.fn(),
    } as any;

    convertCurrencyTotalsService = {
      execute: jest.fn().mockResolvedValue({
        convertedTotal: 100.0,
        targetCurrency: 'EUR',
      }),
    } as any;

    service = new GetDashboardStatsService(
      subscriptionRepository,
      usageCheckRepository,
      usageResponseRepository,
      settingsRepository,
      convertCurrencyTotalsService
    );
  });

  describe('execute', () => {
    it('should calculate total monthly cost correctly', async () => {
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
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Spotify',
          cost: new Money(9.99, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-15'),
          slackUserIds: ['U123'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      expect(result.currencyTotals).toHaveLength(1);
      expect(result.currencyTotals[0].totalMonthly).toBe(25.98);
      expect(result.currencyTotals[0].currency).toBe('EUR');
      expect(result.currencyTotals[0].subscriptionCount).toBe(2);
      expect(result.convertedTotal).toBe(100.0);
      expect(result.preferredCurrency).toBe('EUR');
      expect(convertCurrencyTotalsService.execute).toHaveBeenCalledWith({
        currencyTotals: expect.arrayContaining([
          expect.objectContaining({ currency: 'EUR', totalMonthly: 25.98 })
        ]),
        targetCurrency: 'EUR',
      });
    });

    it('should calculate upcoming renewals correctly', async () => {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Netflix',
          cost: new Money(15.99, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: nextWeek,
          slackUserIds: ['U123'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      expect(result.upcomingRenewals).toHaveLength(1);
      expect(result.upcomingRenewals[0].id).toBe(1);
      expect(result.upcomingRenewals[0].name).toBe('Netflix');
    });

    it('should handle multiple currencies', async () => {
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
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'GitHub',
          cost: new Money(99, 'USD'),
          renewalCycle: RenewalCycle.YEARLY,
          renewalDate: new Date('2027-01-01'),
          slackUserIds: ['U123'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      expect(result.currencyTotals.length).toBeGreaterThan(1);
    });

    it('should handle subscriptions without users', async () => {
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Unassigned',
          cost: new Money(10, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: [],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      expect(result.subscriptionsWithoutUsers).toHaveLength(1);
    });

    it('should group by projects correctly', async () => {
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Tool 1',
          cost: new Money(10, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
          projects: ['Marketing'],
        }),
        Subscription.create({
          id: 2,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Tool 2',
          cost: new Money(20, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
          projects: ['Marketing'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      const marketingProject = result.projectExpenses.find(p => p.project === 'Marketing');
      expect(marketingProject).toBeDefined();
      expect(marketingProject?.monthlyAmount).toBe(30);
      expect(marketingProject?.currency).toBe('EUR');
      expect(marketingProject?.subscriptionCount).toBe(2);
    });

    it('should retrieve preferred currency from settings', async () => {
      settingsRepository.getPreferredCurrency.mockResolvedValue('USD');
      
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'Test',
          cost: new Money(10, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);
      convertCurrencyTotalsService.execute.mockResolvedValue({
        convertedTotal: 9.2,
        targetCurrency: 'USD',
      });

      const result = await service.execute('WS123');

      expect(settingsRepository.getPreferredCurrency).toHaveBeenCalledWith('WS123');
      expect(convertCurrencyTotalsService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ targetCurrency: 'USD' })
      );
      expect(result.preferredCurrency).toBe('USD');
      expect(result.convertedTotal).toBe(9.2);
    });

    it('should handle subscriptions with no projects', async () => {
      const mockSubscriptions = [
        Subscription.create({
          id: 1,
          slackWorkspaceId: 'WS123',
          createdBySlackUserId: 'U123',
          name: 'No Project',
          cost: new Money(10, 'EUR'),
          renewalCycle: RenewalCycle.MONTHLY,
          renewalDate: new Date('2026-02-01'),
          slackUserIds: ['U123'],
          projects: [],
        }),
      ];

      subscriptionRepository.findAll.mockResolvedValue(mockSubscriptions);

      const result = await service.execute('WS123');

      const noProject = result.projectExpenses.find(p => p.project === 'No Project');
      expect(noProject).toBeDefined();
    });
  });
});

