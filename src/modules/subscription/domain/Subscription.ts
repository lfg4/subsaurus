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
    private _name: string,
    private _cost: Money,
    private _renewalCycle: RenewalCycle,
    private _renewalDate: Date,
    private _slackUserIds: string[],
    private _projects: string[],
    private _notes: string | null,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  get name(): string {
    return this._name;
  }

  get cost(): Money {
    return this._cost;
  }

  get renewalCycle(): RenewalCycle {
    return this._renewalCycle;
  }

  get slackUserIds(): string[] {
    return this._slackUserIds;
  }

  get projects(): string[] {
    return this._projects;
  }

  get notes(): string | null {
    return this._notes;
  }

  get updatedAt(): Date {
    return this._updatedAt;
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
    notes?: string | null;
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
      data.notes || null,
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
    notes?: string | null;
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
      data.notes || null,
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
      this._renewalCycle
    );
    return this._renewalDate;
  }

  scheduleNextUsageCheck(daysBeforeRenewal?: number): UsageCheckSchedule {
    const periodStart = RenewalCalculator.calculatePeriodStart(
      this._renewalDate,
      this._renewalCycle
    );
    const periodEnd = this._renewalDate;
    const sendAt = RenewalCalculator.calculateUsageCheckDate(this._renewalDate, daysBeforeRenewal);

    return {
      periodStart,
      periodEnd,
      sendAt,
    };
  }

  hasUser(slackUserId: string): boolean {
    return this._slackUserIds.includes(slackUserId);
  }

  getFormattedCost(): string {
    return this._cost.format();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Subscription name cannot be empty');
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  updateCost(cost: Money): void {
    this._cost = cost;
    this._updatedAt = new Date();
  }

  updateRenewalCycle(renewalCycle: RenewalCycle): void {
    this._renewalCycle = renewalCycle;
    this._updatedAt = new Date();
  }

  updateRenewalDate(renewalDate: Date): void {
    this._renewalDate = renewalDate;
    this._updatedAt = new Date();
  }

  updateProjects(projects: string[]): void {
    this._projects = projects;
    this._updatedAt = new Date();
  }

  updateNotes(notes: string | null): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  updateUsers(slackUserIds: string[]): void {
    if (slackUserIds.length === 0) {
      throw new Error('Subscription must have at least one user');
    }
    this._slackUserIds = slackUserIds;
    this._updatedAt = new Date();
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
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    const { amount, currency } = this._cost.toPrimitives();
    return {
      id: this.id,
      slackWorkspaceId: this.slackWorkspaceId,
      createdBySlackUserId: this.createdBySlackUserId,
      name: this._name,
      costAmount: amount,
      costCurrency: currency,
      renewalCycle: this._renewalCycle,
      renewalDate: this._renewalDate,
      slackUserIds: this._slackUserIds,
      projects: this._projects,
      notes: this._notes,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

export type SubscriptionPrimitives = ReturnType<Subscription['toPrimitives']>;
