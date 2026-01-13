export type ResponseType = 'YES' | 'NO' | 'LITTLE';

export class UsageResponse {
  id: number;
  slackWorkspaceId: string;
  usageCheckId: number;
  subscriptionId: number;
  slackUserId: string;
  response: ResponseType | null;
  respondedAt: Date | null;

  constructor(data: {
    id: number;
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
    response: string | null;
    respondedAt: Date | null;
  }) {
    this.id = data.id;
    this.slackWorkspaceId = data.slackWorkspaceId;
    this.usageCheckId = data.usageCheckId;
    this.subscriptionId = data.subscriptionId;
    this.slackUserId = data.slackUserId;
    this.response = data.response as ResponseType | null;
    this.respondedAt = data.respondedAt;
  }

  hasResponded(): boolean {
    return this.response !== null && this.respondedAt !== null;
  }

  isPositive(): boolean {
    return this.response === 'YES';
  }

  isNegative(): boolean {
    return this.response === 'NO';
  }

  isLittle(): boolean {
    return this.response === 'LITTLE';
  }

  getResponseTime(usageCheckSentAt: Date): number | null {
    if (!this.respondedAt) return null;
    const diffTime = this.respondedAt.getTime() - usageCheckSentAt.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    return diffMinutes;
  }

  wasRespondedQuickly(usageCheckSentAt: Date, thresholdMinutes: number = 60): boolean {
    const responseTime = this.getResponseTime(usageCheckSentAt);
    return responseTime !== null && responseTime <= thresholdMinutes;
  }
}

