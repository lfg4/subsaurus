export type UsageCheckStatus = 'SENT' | 'SCHEDULED';

export class UsageCheck {
  id: number;
  slackWorkspaceId: string;
  subscriptionId: number;
  periodStart: Date;
  periodEnd: Date;
  sendAt: Date;
  status: UsageCheckStatus;
  createdAt: Date;

  constructor(data: {
    id: number;
    slackWorkspaceId: string;
    subscriptionId: number;
    periodStart: Date;
    periodEnd: Date;
    sendAt: Date;
    status: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.slackWorkspaceId = data.slackWorkspaceId;
    this.subscriptionId = data.subscriptionId;
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.sendAt = data.sendAt;
    this.status = data.status as UsageCheckStatus;
    this.createdAt = data.createdAt;
  }

  isScheduled(): boolean {
    return this.status === 'SCHEDULED';
  }

  isSent(): boolean {
    return this.status === 'SENT';
  }

  shouldBeSent(): boolean {
    const now = new Date();
    return this.isScheduled() && this.sendAt <= now;
  }

  getPeriodDuration(): number {
    const diffTime = this.periodEnd.getTime() - this.periodStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isWithinPeriod(date: Date): boolean {
    return date >= this.periodStart && date <= this.periodEnd;
  }
}

