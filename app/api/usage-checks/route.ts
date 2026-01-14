import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetEnrichedUsageChecksService } from '@/src/modules/usage-tracking/application/GetEnrichedUsageChecks.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionIdStr = searchParams.get('subscriptionId');

    const getEnrichedUsageChecksService = container.resolve<GetEnrichedUsageChecksService>(
      'GetEnrichedUsageChecksService'
    );

    let usageChecks;

    if (subscriptionIdStr) {
      const subscriptionId = parseInt(subscriptionIdStr);
      if (Number.isNaN(subscriptionId)) {
        return NextResponse.json(
          { error: 'Invalid subscriptionId' },
          { status: 400 }
        );
      }
      usageChecks = await getEnrichedUsageChecksService.execute(subscriptionId);
    } else {
      usageChecks = await getEnrichedUsageChecksService.execute();
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