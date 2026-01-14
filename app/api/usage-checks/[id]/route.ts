import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetUsageChecksService } from '@/src/modules/usage-tracking/application/GetUsageChecks.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const getUsageChecksService = container.resolve<GetUsageChecksService>(
      'GetUsageChecksService'
    );

    const usageCheck = await getUsageChecksService.findById(id);

    if (!usageCheck) {
      return NextResponse.json(
        { error: 'Usage check not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(usageCheck.toPrimitives());
  } catch (error) {
    console.error('Error fetching usage check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage check' },
      { status: 500 }
    );
  }
}
