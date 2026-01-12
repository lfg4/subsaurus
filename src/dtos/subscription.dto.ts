export class CreateSubscriptionDto {
  name: string;
  price: number;
  renewalDate: string; // Formato: "YYYY-MM-DD"
  slackUserIds: string[];
  projects: string[];

  constructor(data: {
    name: string;
    price: number;
    renewalDate: string;
    slackUserIds: string[];
    projects: string[];
  }) {
    this.name = data.name;
    this.price = data.price;
    this.renewalDate = data.renewalDate;
    this.slackUserIds = data.slackUserIds;
    this.projects = data.projects;
  }

  toDate(): Date {
    return new Date(this.renewalDate);
  }
}

export class UpdateSubscriptionDto {
  name?: string;
  price?: number;
  renewalDate?: string;
  slackUserIds?: string[];
  projects?: string[];

  constructor(data: {
    name?: string;
    price?: number;
    renewalDate?: string;
    slackUserIds?: string[];
    projects?: string[];
  }) {
    this.name = data.name;
    this.price = data.price;
    this.renewalDate = data.renewalDate;
    this.slackUserIds = data.slackUserIds;
    this.projects = data.projects;
  }
}

