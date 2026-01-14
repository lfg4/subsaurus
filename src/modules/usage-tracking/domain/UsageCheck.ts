import { Entity } from '@/src/shared/domain/Entity';
import { UsageCheckStatus } from '@/src/types/enums';


export class UsageCheck extends Entity<number> {
  private constructor(
    id: number,
    public readonly slackWorkspaceId: string,
    public readonly subscriptionId: number,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly sendAt: Date,
    private _status: UsageCheckStatus,
    public readonly createdAt: Date
  ) {
    super(id);
  }

  
  static create(data: {
    id?: number;
    slackWorkspaceId: string;
    subscriptionId: number;
    periodStart: Date;
    periodEnd: Date;
    sendAt: Date;
    status?: UsageCheckStatus;
  }): UsageCheck {
    return new UsageCheck(
      data.id || 0,
      data.slackWorkspaceId,
      data.subscriptionId,
      data.periodStart,
      data.periodEnd,
      data.sendAt,
      data.status || UsageCheckStatus.SCHEDULED,
      new Date()
    );
  }

  
  static fromPrimitives(data: {
    id: number;
    slackWorkspaceId: string;
    subscriptionId: number;
    periodStart: Date;
    periodEnd: Date;
    sendAt: Date;
    status: string;
    createdAt: Date;
  }): UsageCheck {
    return new UsageCheck(
      data.id,
      data.slackWorkspaceId,
      data.subscriptionId,
      data.periodStart,
      data.periodEnd,
      data.sendAt,
      data.status as UsageCheckStatus,
      data.createdAt
    );
  }

  get status(): UsageCheckStatus {
    return this._status;
  }

  isScheduled(): boolean {
    return this._status === UsageCheckStatus.SCHEDULED;
  }

  isSent(): boolean {
    return this._status === UsageCheckStatus.SENT;
  }

  shouldBeSent(): boolean {
    const now = new Date();
    return this.isScheduled() && this.sendAt <= now;
  }

  markAsSent(): void {
    if (!this.isScheduled()) {
      throw new Error('Can only mark scheduled usage checks as sent');
    }
    this._status = UsageCheckStatus.SENT;
  }

  getPeriodDuration(): number {
    const diffTime = this.periodEnd.getTime() - this.periodStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isWithinPeriod(date: Date): boolean {
    return date >= this.periodStart && date <= this.periodEnd;
  }

  toPrimitives(): {
    id: number;
    slackWorkspaceId: string;
    subscriptionId: number;
    periodStart: Date;
    periodEnd: Date;
    sendAt: Date;
    status: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      slackWorkspaceId: this.slackWorkspaceId,
      subscriptionId: this.subscriptionId,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      sendAt: this.sendAt,
      status: this._status,
      createdAt: this.createdAt,
    };
  }
}

