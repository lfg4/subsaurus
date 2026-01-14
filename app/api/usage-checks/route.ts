import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetUsageChecksService } from '@/src/modules/usage-tracking/application/GetUsageChecks.service';
import type { UsageCheck } from '@/src/modules/usage-tracking/domain/UsageCheck';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionIdStr = searchParams.get('subscriptionId');

    const getUsageChecksService = container.resolve<GetUsageChecksService>(
      'GetUsageChecksService'
    );

    let usageChecks: UsageCheck[];

    if (subscriptionIdStr) {
      const subscriptionId = parseInt(subscriptionIdStr);
      if (Number.isNaN(subscriptionId)) {
        return NextResponse.json(
          { error: 'Invalid subscriptionId' },
          { status: 400 }
        );
      }
      usageChecks = await getUsageChecksService.findBySubscriptionId(subscriptionId);
    } else {
      usageChecks = await getUsageChecksService.findAll();
    }

    const data = usageChecks.map(uc => uc.toPrimitives());

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching usage checks:', error);
    return NextResponse.json(
      { error: 'Failed to load usage checks' },
      { status: 500 }
    );
  }
}
