import { GetUsageCheckByIdService } from '../application/GetUsageCheckById.service';
import { UsageCheck } from '../domain/UsageCheck';
import { UsageCheckStatus } from '@/src/types/enums';
import type { UsageCheckRepository } from '../infrastructure/UsageCheckRepository';

describe('GetUsageCheckByIdService', () => {
  let service: GetUsageCheckByIdService;
  let usageCheckRepository: jest.Mocked<UsageCheckRepository>;

  beforeEach(() => {
    usageCheckRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findScheduled: jest.fn(),
      findNeedingReminder: jest.fn(),
      findBySubscriptionId: jest.fn(),
      findBySubscriptionAndPeriod: jest.fn(),
    } as any;

    service = new GetUsageCheckByIdService(usageCheckRepository);
  });

  describe('execute', () => {
    it('should return usage check when found', async () => {
      const mockCheck = UsageCheck.create({
        id: 1,
        slackWorkspaceId: 'WS123',
        subscriptionId: 5,
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-01-31'),
        sendAt: new Date('2026-01-24'),
      });

      usageCheckRepository.findById.mockResolvedValue(mockCheck);

      const result = await service.execute(1);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.subscriptionId).toBe(5);
    });

    it('should return null when not found', async () => {
      usageCheckRepository.findById.mockResolvedValue(null);

      const result = await service.execute(999);

      expect(result).toBeNull();
    });

    it('should preserve all check properties', async () => {
      const mockCheck = UsageCheck.create({
        id: 2,
        slackWorkspaceId: 'WS456',
        subscriptionId: 10,
        periodStart: new Date('2026-02-01'),
        periodEnd: new Date('2026-02-28'),
        sendAt: new Date('2026-02-21'),
      });

      usageCheckRepository.findById.mockResolvedValue(mockCheck);

      const result = await service.execute(2);

      expect(result?.slackWorkspaceId).toBe('WS456');
      expect(result?.subscriptionId).toBe(10);
    });
  });
});

