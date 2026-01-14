import { Entity } from '@/src/shared/domain/Entity';
import { Money } from './Money';
import { RenewalCalculator } from './RenewalCalculator';
import type { RenewalCycle } from '@/src/types/enums';


export interface UsageCheckSchedule {
  periodStart: Date;
  periodEnd: Date;
  sendAt: Date;
}

export class Subscription extends Entity<number> {
  private constructor(
    id: number,
    public readonly slackWorkspaceId: string,
    public readonly createdBySlackUserId: string,
    public readonly name: string,
    public readonly cost: Money,
    public readonly renewalCycle: RenewalCycle,
    private _renewalDate: Date,
    public readonly slackUserIds: string[],
    public readonly projects: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    super(id);
  }

  static create(data: {
    id?: number;
    slackWorkspaceId: string;
    createdBySlackUserId: string;
    name: string;
    cost: Money;
    renewalCycle: RenewalCycle;
    renewalDate: Date;
    slackUserIds: string[];
    projects?: string[];
  }): Subscription {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Subscription name cannot be empty');
    }

    if (data.slackUserIds.length === 0) {
      throw new Error('Subscription must have at least one user');
    }

    return new Subscription(
      data.id || 0,
      data.slackWorkspaceId,
      data.createdBySlackUserId,
      data.name,
      data.cost,
      data.renewalCycle,
      data.renewalDate,
      data.slackUserIds,
      data.projects || [],
      new Date(),
      new Date()
    );
  }

  static fromPrimitives(data: {
    id: number;
    slackWorkspaceId: string;
    createdBySlackUserId: string;
    name: string;
    costAmount: number;
    costCurrency: string;
    renewalCycle: RenewalCycle;
    renewalDate: Date;
    slackUserIds: string[];
    projects: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Subscription {
    return new Subscription(
      data.id,
      data.slackWorkspaceId,
      data.createdBySlackUserId,
      data.name,
      Money.fromPrimitives(data.costAmount, data.costCurrency),
      data.renewalCycle,
      data.renewalDate,
      data.slackUserIds,
      data.projects,
      data.createdAt,
      data.updatedAt
    );
  }

  get renewalDate(): Date {
    return this._renewalDate;
  }

  getDaysUntilRenewal(): number {
    return RenewalCalculator.calculateDaysUntilRenewal(this._renewalDate);
  }

  isExpiringSoon(thresholdDays: number = 7): boolean {
    return RenewalCalculator.isExpiringSoon(this._renewalDate, thresholdDays);
  }

  renew(): Date {
    this._renewalDate = RenewalCalculator.calculateNextRenewal(
      this._renewalDate,
      this.renewalCycle
    );
    return this._renewalDate;
  }

  scheduleNextUsageCheck(): UsageCheckSchedule {
    const periodStart = RenewalCalculator.calculatePeriodStart(
      this._renewalDate,
      this.renewalCycle
    );
    const periodEnd = this._renewalDate;
    const sendAt = RenewalCalculator.calculateUsageCheckDate(this._renewalDate);

    return {
      periodStart,
      periodEnd,
      sendAt,
    };
  }

  hasUser(slackUserId: string): boolean {
    return this.slackUserIds.includes(slackUserId);
  }

  getFormattedCost(): string {
    return this.cost.format();
  }

  toPrimitives(): {
    id: number;
    slackWorkspaceId: string;
    createdBySlackUserId: string;
    name: string;
    costAmount: number;
    costCurrency: string;
    renewalCycle: RenewalCycle;
    renewalDate: Date;
    slackUserIds: string[];
    projects: string[];
    createdAt: Date;
    updatedAt: Date;
  } {
    const { amount, currency } = this.cost.toPrimitives();
    return {
      id: this.id,
      slackWorkspaceId: this.slackWorkspaceId,
      createdBySlackUserId: this.createdBySlackUserId,
      name: this.name,
      costAmount: amount,
      costCurrency: currency,
      renewalCycle: this.renewalCycle,
      renewalDate: this._renewalDate,
      slackUserIds: this.slackUserIds,
      projects: this.projects,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type SubscriptionPrimitives = ReturnType<Subscription['toPrimitives']>;
