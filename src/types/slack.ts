// Tipos para respuestas de Slack

export interface SlackBlocksResponse {
  blocks: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: unknown[];
  [key: string]: unknown;
}

export interface SlackModalResponse {
  type: 'modal';
  trigger_id: string;
  view: SlackModalView;
}

export interface SlackModalView {
  type: string;
  callback_id?: string;
  title: {
    type: string;
    text: string;
  };
  blocks: SlackBlock[];
  submit?: {
    type: string;
    text: string;
  };
  close?: {
    type: string;
    text: string;
  };
}

export interface SlackInteractionPayload {
  type: string;
  view?: {
    state: {
      values: Record<string, Record<string, unknown>>;
    };
  };
  [key: string]: unknown;
}

export interface SlackSubscriptionData {
  name: string;
  price: number;
  renewalDate: string;
  users: string[];
  projects: string[];
}

export type SlackResponse = string | SlackBlocksResponse | SlackModalResponse;

