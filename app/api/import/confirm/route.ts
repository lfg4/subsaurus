import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { ImportSubscriptionsService } from '@/src/modules/import/application/ImportSubscriptions.service';
import type { SubscriptionPreview } from '@/src/modules/import/application/ImportSubscriptions.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patterns, options } = body as {
      patterns: SubscriptionPreview[];
      options: {
        slackWorkspaceId: string;
        createdBySlackUserId: string;
        defaultSlackUserIds: string[];
        skipDuplicates: boolean;
      };
    };

    if (!patterns || !options) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const importService = container.resolve<ImportSubscriptionsService>(
      'ImportSubscriptionsService'
    );

    const result = await importService.importFromPreviews(patterns, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing subscriptions:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error importing subscriptions' 
      },
      { status: 500 }
    );
  }
}
