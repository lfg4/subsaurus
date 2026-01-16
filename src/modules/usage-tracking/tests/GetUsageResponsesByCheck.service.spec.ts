import { GetUsageResponsesByCheckService } from '../application/GetUsageResponsesByCheck.service';
import { UsageResponse } from '../domain/UsageResponse';
import { UsageResponseType } from '@/src/types/enums';
import type { UsageResponseRepository } from '../infrastructure/UsageResponseRepository';

describe('GetUsageResponsesByCheckService', () => {
  let service: GetUsageResponsesByCheckService;
  let usageResponseRepository: jest.Mocked<UsageResponseRepository>;

  beforeEach(() => {
    usageResponseRepository = {
      findByUsageCheck: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new GetUsageResponsesByCheckService(usageResponseRepository);
  });

  describe('execute', () => {
    it('should return all responses for a check', async () => {
      const mockResponses = [
        UsageResponse.createPending({
          id: 1,
          slackWorkspaceId: 'WS123',
          usageCheckId: 1,
          subscriptionId: 5,
          slackUserId: 'U123',
        }),
        UsageResponse.createPending({
          id: 2,
          slackWorkspaceId: 'WS123',
          usageCheckId: 1,
          subscriptionId: 5,
          slackUserId: 'U456',
        }),
      ];

      usageResponseRepository.findByUsageCheck.mockResolvedValue(mockResponses);

      const result = await service.execute(1);

      expect(result).toHaveLength(2);
      expect(result[0].usageCheckId).toBe(1);
      expect(result[1].usageCheckId).toBe(1);
    });

    it('should return empty array when no responses', async () => {
      usageResponseRepository.findByUsageCheck.mockResolvedValue([]);

      const result = await service.execute(999);

      expect(result).toEqual([]);
    });

    it('should include both pending and answered responses', async () => {
      const pendingResponse = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      const answeredResponse = UsageResponse.createPending({
        id: 2,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U456',
      });
      answeredResponse.recordResponse(UsageResponseType.YES);

      const mockResponses = [pendingResponse, answeredResponse];

      usageResponseRepository.findByUsageCheck.mockResolvedValue(mockResponses);

      const result = await service.execute(1);

      expect(result).toHaveLength(2);
      expect(result[0].hasResponded()).toBe(false);
      expect(result[1].hasResponded()).toBe(true);
    });
  });
});

