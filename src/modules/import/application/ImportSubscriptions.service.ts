import type { SubscriptionPattern } from '../domain/SubscriptionPattern';
import type { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import { Subscription } from '@/src/modules/subscription/domain/Subscription';
import { Money } from '@/src/modules/subscription/domain/Money';
import { RenewalCycle } from '@/src/types/enums';

export interface ImportOptions {
  slackWorkspaceId: string;
  createdBySlackUserId: string;
  defaultSlackUserIds: string[];
  skipDuplicates: boolean;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ pattern: string; error: string }>;
}

export interface SubscriptionPreview {
  name: string;
  amount: string;
  cycle: string;
  nextRenewal: string;
  occurrences: number;
  confidence: string;
}

export class ImportSubscriptionsService {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async importPatterns(
    patterns: SubscriptionPattern[],
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    let existingSubscriptions: Subscription[] = [];
    if (options.skipDuplicates) {
      const allSubscriptions = await this.subscriptionRepository.findAll();
      existingSubscriptions = allSubscriptions.filter(
        sub => sub.slackWorkspaceId === options.slackWorkspaceId
      );
    }

    for (const pattern of patterns) {
      try {
        if (options.skipDuplicates) {
          const isDuplicate = this.isDuplicate(pattern, existingSubscriptions);
          if (isDuplicate) {
            result.skipped++;
            continue;
          }
        }

        if (!pattern.suggestedCycle || !pattern.suggestedRenewalDate) {
          result.errors.push({
            pattern: pattern.name,
            error: 'Missing cycle or renewal date',
          });
          continue;
        }

        const subscription = Subscription.create({
          slackWorkspaceId: options.slackWorkspaceId,
          createdBySlackUserId: options.createdBySlackUserId,
          name: pattern.name,
          cost: Money.fromPrimitives(pattern.suggestedCost, pattern.suggestedCurrency),
          renewalCycle: pattern.suggestedCycle,
          renewalDate: pattern.suggestedRenewalDate,
          slackUserIds: options.defaultSlackUserIds,
          projects: [],
        });

        await this.subscriptionRepository.save(subscription, options.defaultSlackUserIds);

        result.imported++;
      } catch (error) {
        result.errors.push({
          pattern: pattern.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  async importFromPreviews(
    previews: SubscriptionPreview[],
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    let existingSubscriptions: Subscription[] = [];
    if (options.skipDuplicates) {
      const allSubscriptions = await this.subscriptionRepository.findAll();
      existingSubscriptions = allSubscriptions.filter(
        sub => sub.slackWorkspaceId === options.slackWorkspaceId
      );
    }

    const cycleMap: Record<string, RenewalCycle> = {
      'Mensual': RenewalCycle.MONTHLY,
      'Trimestral': RenewalCycle.QUARTERLY,
      'Semestral': RenewalCycle.SEMESTRAL,
      'Anual': RenewalCycle.YEARLY,
    };

    for (const preview of previews) {
      try {
        if (options.skipDuplicates) {
          const isDuplicate = existingSubscriptions.some(sub => {
            const normalizedPreviewName = preview.name.toLowerCase().trim();
            const normalizedSubName = sub.name.toLowerCase().trim();
            return normalizedSubName.includes(normalizedPreviewName) || 
                   normalizedPreviewName.includes(normalizedSubName);
          });
          
          if (isDuplicate) {
            result.skipped++;
            continue;
          }
        }

        const amountMatch = preview.amount.match(/([\d.]+)\s*(\w+)/);
        if (!amountMatch) {
          result.errors.push({
            pattern: preview.name,
            error: 'Invalid amount format',
          });
          continue;
        }

        const amount = parseFloat(amountMatch[1]);
        const currency = amountMatch[2];
        
        const cycle = cycleMap[preview.cycle];
        if (!cycle) {
          result.errors.push({
            pattern: preview.name,
            error: 'Cycle not recognized',
          });
          continue;
        }

        const dateParts = preview.nextRenewal.split('/');
        const renewalDate = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );

        const subscription = Subscription.create({
          slackWorkspaceId: options.slackWorkspaceId,
          createdBySlackUserId: options.createdBySlackUserId,
          name: preview.name,
          cost: Money.fromPrimitives(amount, currency),
          renewalCycle: cycle,
          renewalDate: renewalDate,
          slackUserIds: options.defaultSlackUserIds,
          projects: [],
        });

        await this.subscriptionRepository.save(subscription, options.defaultSlackUserIds);
        result.imported++;
        
      } catch (error) {
        result.errors.push({
          pattern: preview.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  private isDuplicate(
    pattern: SubscriptionPattern,
    existingSubscriptions: Subscription[]
  ): boolean {
    const normalizedPatternName = pattern.name.toLowerCase().trim();

    return existingSubscriptions.some(sub => {
      const normalizedSubName = sub.name.toLowerCase().trim();
      
      if (normalizedSubName.includes(normalizedPatternName) || 
          normalizedPatternName.includes(normalizedSubName)) {
        return true;
      }

      return false;
    });
  }
}

