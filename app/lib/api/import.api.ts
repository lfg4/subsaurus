import { apiClient } from './client';

export interface TransactionData {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

export interface SubscriptionPreview {
  name: string;
  amount: string;
  cycle: string;
  nextRenewal: string;
  occurrences: number;
  confidence: string;
  transactions: Array<{ date: string; amount: number }>;
  transactions: Array<{ date: string; amount: number; currency: string }>;
}

export interface DetectSubscriptionsRequest {
  transactions: TransactionData[];
}

export interface DetectSubscriptionsResponse {
  previews: SubscriptionPreview[];
}

export interface ImportOptions {
  slackWorkspaceId: string;
  createdBySlackUserId: string;
  defaultSlackUserIds: string[];
  skipDuplicates: boolean;
}

export interface ConfirmImportRequest {
  patterns: SubscriptionPreview[];
  options: ImportOptions;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ pattern: string; error: string }>;
}

class ImportApi {
  
  async detectSubscriptions(transactions: TransactionData[]): Promise<DetectSubscriptionsResponse> {
    return apiClient.post<DetectSubscriptionsResponse>('/import/detect', { transactions });
  }

  async confirmImport(patterns: SubscriptionPreview[], options: ImportOptions): Promise<ImportResult> {
    return apiClient.post<ImportResult>('/import/confirm', { patterns, options });
  }
}

export const importApi = new ImportApi();

