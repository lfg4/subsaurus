import type { RenewalCycle } from '../types/enums';

export interface SubscriptionDto {
  name: string;
  price: number;
  currency: string;
  renewalCycle: RenewalCycle;
  renewalDate: string; // Formato: "YYYY-MM-DD"
  slackUserIds: string[];
  projects: string[];
}

export class Subscription {
  id: number;
  slackWorkspaceId: string;
  name: string;
  price: number;
  renewalCycle: RenewalCycle;
  renewalDate: Date;
  slackUserIds: string[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: number;
    slackWorkspaceId: string;
    name: string;
    price: number;
    renewalCycle: RenewalCycle;
    renewalDate: Date;
    slackUserIds: string[];
    projects: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.slackWorkspaceId = data.slackWorkspaceId;
    this.name = data.name;
    this.price = data.price;
    this.renewalCycle = data.renewalCycle;
    this.renewalDate = data.renewalDate;
    this.slackUserIds = data.slackUserIds;
    this.projects = data.projects;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  getDaysUntilRenewal(): number {
    const now = new Date();
    const renewal = new Date(this.renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isExpiringSoon(days: number = 7): boolean {
    const daysUntilRenewal = this.getDaysUntilRenewal();
    return daysUntilRenewal >= 0 && daysUntilRenewal <= days;
  }
}

