import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { DetectSubscriptionsService } from '@/src/modules/import/application/DetectSubscriptions.service';
import { Transaction } from '@/src/modules/import/domain/Transaction';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

interface TransactionData {
  date: string;
  description: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions } = body as { transactions: TransactionData[] };

    if (!transactions || !Array.isArray(transactions)) {
      return createValidationError('Missing transactions array');
    }

    const txObjects = transactions.map(tx => 
      Transaction.create({
        date: new Date(tx.date),
        description: tx.description,
        amount: tx.amount,
        currency: tx.currency,
        rawRow: {}
      })
    );

    const detector = container.resolve<DetectSubscriptionsService>('DetectSubscriptionsService');
    const allPatterns = await detector.detectPatterns(txObjects);
    const likelyPatterns = detector.filterLikelySubscriptions(allPatterns);
    const previews = likelyPatterns.map(pattern => pattern.toPreview());

    return NextResponse.json({ previews });
  } catch (error) {
    return handleApiError(error, 'detect subscriptions', 'Error detecting subscriptions');
  }
}

