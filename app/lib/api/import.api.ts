import { apiClient } from './client';

export interface TransactionData {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

export interface SubscriptionPreview {
  description: string;
  amount: number;
  currency: string;
  frequency: string;
  transactionCount: number;
  lastDate: string;
  confidence: number;
  transactions: TransactionData[];
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
  failed: number;
  errors: string[];
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

