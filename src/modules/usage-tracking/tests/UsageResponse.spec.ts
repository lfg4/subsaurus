import { UsageResponse } from '../domain/UsageResponse';
import { UsageResponseType } from '@/src/types/enums';

describe('UsageResponse', () => {
  describe('createPending', () => {
    it('should create pending response without answer', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      expect(response.hasResponded()).toBe(false);
      expect(response.response).toBeNull();
      expect(response.respondedAt).toBeNull();
    });
  });

  describe('recordResponse', () => {
    it('should record YES response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.YES);

      expect(response.hasResponded()).toBe(true);
      expect(response.isPositive()).toBe(true);
      expect(response.response).toBe(UsageResponseType.YES);
      expect(response.respondedAt).toBeDefined();
    });

    it('should record NO response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.NO);

      expect(response.isNegative()).toBe(true);
      expect(response.response).toBe(UsageResponseType.NO);
    });

    it('should record LITTLE response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.LITTLE);

      expect(response.isLittle()).toBe(true);
      expect(response.response).toBe(UsageResponseType.LITTLE);
    });
  });

  describe('response type checks', () => {
    it('should correctly identify positive response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.YES);

      expect(response.isPositive()).toBe(true);
      expect(response.isNegative()).toBe(false);
      expect(response.isLittle()).toBe(false);
    });

    it('should correctly identify negative response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.NO);

      expect(response.isPositive()).toBe(false);
      expect(response.isNegative()).toBe(true);
      expect(response.isLittle()).toBe(false);
    });

    it('should correctly identify little response', () => {
      const response = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      response.recordResponse(UsageResponseType.LITTLE);

      expect(response.isPositive()).toBe(false);
      expect(response.isNegative()).toBe(false);
      expect(response.isLittle()).toBe(true);
    });
  });

  describe('fromPrimitives and toPrimitives', () => {
    it('should convert to and from primitives correctly', () => {
      const original = UsageResponse.createPending({
        id: 1,
        slackWorkspaceId: 'WS123',
        usageCheckId: 1,
        subscriptionId: 5,
        slackUserId: 'U123',
      });

      original.recordResponse(UsageResponseType.YES);

      const primitives = original.toPrimitives();
      const restored = UsageResponse.fromPrimitives(primitives);

      expect(restored.id).toBe(original.id);
      expect(restored.response).toBe(original.response);
      expect(restored.hasResponded()).toBe(true);
    });
  });
});

