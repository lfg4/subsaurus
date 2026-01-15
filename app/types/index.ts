export type { SubscriptionPrimitives as Subscription } from '@/src/modules/subscription/domain/Subscription';
export type { UsageCheckPrimitives as UsageCheck } from '@/src/modules/usage-tracking/domain/UsageCheck';
export type { UsageResponsePrimitives as UsageResponse } from '@/src/modules/usage-tracking/domain/UsageResponse';

export interface User {
  id: string;
  slackUserId: string;
  slackWorkspaceId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}
