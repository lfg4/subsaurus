export class SubscriptionEntity {
  id: number;
  name: string;
  price: number;
  renewalDate: Date;
  slackUserIds: string[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: number;
    name: string;
    price: number;
    renewalDate: Date;
    slackUserIds: string[];
    projects: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
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

