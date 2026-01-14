export interface User {
  id: string;
  slack_user_id: string;
  slack_workspace_id: string;
  display_name: string;
  email: string;
  avatar_url: string;
}

export interface Subscription {
  id: number;
  name: string;
  project: string;
  renewal_cycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  renewal_date: string;
  cost_amount: number;
  cost_currency: string;
  users_count?: number;
  last_check_summary?: {
    yes: number;
    no: number;
    little: number;
    no_response: number;
  };
}

export interface UsageCheck {
  id: number;
  subscription_id: number;
  subscription_name: string;
  period_start: string;
  period_end: string;
  send_at: string;
  status: 'SCHEDULED' | 'SENT' | 'CLOSED';
  responses_count: number;
}