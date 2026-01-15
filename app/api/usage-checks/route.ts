import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetEnrichedUsageChecksService } from '@/src/modules/usage-tracking/application/GetEnrichedUsageChecks.service';
import { EnrichedUsageCheckDTO } from '@/app/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionIdStr = searchParams.get('subscriptionId');
    const workspaceId = searchParams.get('workspaceId');

    const getEnrichedUsageChecksService = container.resolve<GetEnrichedUsageChecksService>(
      'GetEnrichedUsageChecksService'
    );

    let usageChecks: EnrichedUsageCheckDTO[];

    if (subscriptionIdStr) {
      const subscriptionId = parseInt(subscriptionIdStr);
      if (Number.isNaN(subscriptionId)) {
        return NextResponse.json(
          { error: 'Invalid subscriptionId' },
          { status: 400 }
        );
      }
      usageChecks = await getEnrichedUsageChecksService.execute(subscriptionId, workspaceId || undefined);
    } else {
      usageChecks = await getEnrichedUsageChecksService.execute(undefined, workspaceId || undefined);
    }

    return NextResponse.json(usageChecks);
  } catch (error) {
    console.error('Error fetching usage checks:', error);
    return NextResponse.json(
      { error: 'Failed to load usage checks' },
      { status: 500 }
    );
  }
}