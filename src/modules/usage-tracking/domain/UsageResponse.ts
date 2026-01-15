import { Entity } from '@/src/shared/domain/Entity';
import { UsageResponseType } from '@/src/types/enums';


export class UsageResponse extends Entity<number> {
  private constructor(
    id: number,
    public readonly slackWorkspaceId: string,
    public readonly usageCheckId: number,
    public readonly subscriptionId: number,
    public readonly slackUserId: string,
    private _response: UsageResponseType | null,
    private _respondedAt: Date | null,
    public readonly createdAt: Date
  ) {
    super(id);
  }

  
  static createPending(data: {
    id?: number;
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
  }): UsageResponse {
    return new UsageResponse(
      data.id || 0,
      data.slackWorkspaceId,
      data.usageCheckId,
      data.subscriptionId,
      data.slackUserId,
      null,
      null,
      new Date()
    );
  }

  
  static fromPrimitives(data: {
    id: number;
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
    response: string | null;
    respondedAt: Date | null;
    createdAt: Date;
  }): UsageResponse {
    return new UsageResponse(
      data.id,
      data.slackWorkspaceId,
      data.usageCheckId,
      data.subscriptionId,
      data.slackUserId,
      data.response as UsageResponseType | null,
      data.respondedAt,
      data.createdAt
    );
  }

  
  get response(): UsageResponseType | null {
    return this._response;
  }

  get respondedAt(): Date | null {
    return this._respondedAt;
  }

  
  hasResponded(): boolean {
    return this._response !== null && this._respondedAt !== null;
  }

  
  isPositive(): boolean {
    return this._response === UsageResponseType.YES;
  }

  
  isNegative(): boolean {
    return this._response === UsageResponseType.NO;
  }

  
  isLittle(): boolean {
    return this._response === UsageResponseType.LITTLE;
  }

  
  recordResponse(responseType: UsageResponseType): void {
    if (this.hasResponded()) {
      throw new Error('Response has already been recorded');
    }
    this._response = responseType;
    this._respondedAt = new Date();
  }

  
  getResponseTime(usageCheckSentAt: Date): number | null {
    if (!this._respondedAt) return null;
    const diffTime = this._respondedAt.getTime() - usageCheckSentAt.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    return diffMinutes;
  }

  
  wasRespondedQuickly(
    usageCheckSentAt: Date,
    thresholdMinutes: number = 60
  ): boolean {
    const responseTime = this.getResponseTime(usageCheckSentAt);
    return responseTime !== null && responseTime <= thresholdMinutes;
  }

  
  toPrimitives(): {
    id: number;
    slackWorkspaceId: string;
    usageCheckId: number;
    subscriptionId: number;
    slackUserId: string;
    response: string | null;
    respondedAt: Date | null;
    createdAt: Date;
  } {
    return {
      id: this.id,
      slackWorkspaceId: this.slackWorkspaceId,
      usageCheckId: this.usageCheckId,
      subscriptionId: this.subscriptionId,
      slackUserId: this.slackUserId,
      response: this._response,
      respondedAt: this._respondedAt,
      createdAt: this.createdAt,
    };
  }
}

export type UsageResponsePrimitives = ReturnType<UsageResponse['toPrimitives']>;
