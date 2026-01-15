import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { ImportSubscriptionsService } from '@/src/modules/import/application/ImportSubscriptions.service';
import type { SubscriptionPreview } from '@/src/modules/import/application/ImportSubscriptions.service';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

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
      return createValidationError('Missing required parameters');
    }

    const importService = container.resolve<ImportSubscriptionsService>(
      'ImportSubscriptionsService'
    );

    const result = await importService.importFromPreviews(patterns, options);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'import subscriptions', 'Error importing subscriptions');
  }
}
