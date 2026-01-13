export type ResponseType = 'YES' | 'NO' | 'LITTLE';

export class UsageResponse {
  id: number;
  slackWorkspaceId: string;
  usageCheckId: number;
  subscriptionId: number;
  slackUserId: string;
  response: ResponseType | null;
  responsedAt: Date | null;
  createdAt: Date;

  constructor(data: {
    id: number;
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
    response: string | null;
    responsedAt: Date | null;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.slackWorkspaceId = data.slackWorkspaceId;
    this.usageCheckId = data.usageCheckId;
    this.subscriptionId = data.subscriptionId;
    this.slackUserId = data.slackUserId;
    this.response = data.response as ResponseType | null;
    this.responsedAt = data.responsedAt;
    this.createdAt = data.createdAt;
  }

  hasResponded(): boolean {
    return this.response !== null && this.responsedAt !== null;
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
    if (!this.responsedAt) return null;
    const diffTime = this.responsedAt.getTime() - usageCheckSentAt.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    return diffMinutes;
  }

  wasRespondedQuickly(usageCheckSentAt: Date, thresholdMinutes: number = 60): boolean {
    const responseTime = this.getResponseTime(usageCheckSentAt);
    return responseTime !== null && responseTime <= thresholdMinutes;
  }
}

