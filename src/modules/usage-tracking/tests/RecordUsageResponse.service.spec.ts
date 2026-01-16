import { RecordUsageResponseService } from '../application/RecordUsageResponse.service';
import { UsageResponse } from '../domain/UsageResponse';
import { UsageResponseType } from '@/src/types/enums';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';

describe('RecordUsageResponseService', () => {
  let service: RecordUsageResponseService;
  let usageResponseRepository: jest.Mocked<UsageResponseRepository>;

  beforeEach(() => {
    usageResponseRepository = {
      findPendingByUsageCheckAndUser: jest.fn(),
      findById: jest.fn(),
      findByUsageCheck: jest.fn(),
      findByUser: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new RecordUsageResponseService(usageResponseRepository);
  });

  describe('execute', () => {
    it('should record YES response', async () => {
      const mockResponse = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      usageResponseRepository.findPendingByUsageCheckAndUser.mockResolvedValue(mockResponse);
      usageResponseRepository.update.mockResolvedValue(undefined);

      await service.execute(1, 'U123', UsageResponseType.YES);

      expect(usageResponseRepository.findPendingByUsageCheckAndUser).toHaveBeenCalledWith(1, 'U123');
      expect(usageResponseRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          response: UsageResponseType.YES,
        })
      );
    });

    it('should record NO response', async () => {
      const mockResponse = UsageResponse.createPending({
        id: 2,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U456',
      });

      usageResponseRepository.findPendingByUsageCheckAndUser.mockResolvedValue(mockResponse);
      usageResponseRepository.update.mockResolvedValue(undefined);

      await service.execute(1, 'U456', UsageResponseType.NO);

      expect(usageResponseRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          response: UsageResponseType.NO,
        })
      );
    });

    it('should record LITTLE response', async () => {
      const mockResponse = UsageResponse.createPending({
        id: 3,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U789',
      });

      usageResponseRepository.findPendingByUsageCheckAndUser.mockResolvedValue(mockResponse);
      usageResponseRepository.update.mockResolvedValue(undefined);

      await service.execute(1, 'U789', UsageResponseType.LITTLE);

      expect(usageResponseRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          response: UsageResponseType.LITTLE,
        })
      );
    });

    it('should throw error if response not found', async () => {
      usageResponseRepository.findPendingByUsageCheckAndUser.mockResolvedValue(null);

      await expect(service.execute(999, 'U999', UsageResponseType.YES)).rejects.toThrow(
        'Pending response not found for check 999 and user U999'
      );
      expect(usageResponseRepository.update).not.toHaveBeenCalled();
    });

    it('should set respondedAt timestamp', async () => {
      const mockResponse = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      usageResponseRepository.findPendingByUsageCheckAndUser.mockResolvedValue(mockResponse);
      usageResponseRepository.update.mockResolvedValue(undefined);

      await service.execute(1, 'U123', UsageResponseType.YES);

      const updatedResponse = usageResponseRepository.update.mock.calls[0][0];
      expect(updatedResponse.hasResponded()).toBe(true);
    });
  });
});

