import { RenewalCycle } from "../entities/Subscription";

export interface SlackSubscriptionData {
  name: string;
  price: number;
  currency: string;
  renewalCycle: RenewalCycle;
  renewalDate: string;
  users: string[];
  projects: string[];
}
