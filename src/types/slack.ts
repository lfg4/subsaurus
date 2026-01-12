// Tipos para datos de Slack

export interface SlackSubscriptionData {
  name: string;
  price: number;
  currency: string;
  renewalCycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  renewalDate: string;
  users: string[];
  projects: string[];
}
