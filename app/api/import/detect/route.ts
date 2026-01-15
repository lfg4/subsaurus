import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { DetectSubscriptionsService } from '@/src/modules/import/application/DetectSubscriptions.service';
import { Transaction } from '@/src/modules/import/domain/Transaction';

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
      return NextResponse.json(
        { error: 'Missing transactions array' },
        { status: 400 }
      );
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

    const detector = new DetectSubscriptionsService();
    const allPatterns = await detector.detectPatterns(txObjects);
    const likelyPatterns = detector.filterLikelySubscriptions(allPatterns);
    const previews = likelyPatterns.map(pattern => pattern.toPreview());

    return NextResponse.json({ previews });
  } catch (error) {
    console.error('Error detecting subscriptions:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error detecting subscriptions' 
      },
      { status: 500 }
    );
  }
}

