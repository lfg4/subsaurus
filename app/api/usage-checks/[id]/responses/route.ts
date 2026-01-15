import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetUsageResponsesByCheckService } from '@/src/modules/usage-tracking/application/GetUsageResponsesByCheck.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const usageCheckId = parseInt(idStr);

    if (Number.isNaN(usageCheckId)) {
      return NextResponse.json(
        { error: 'Invalid usage check ID' },
        { status: 400 }
      );
    }

    const getUsageResponsesByCheckService = container.resolve<GetUsageResponsesByCheckService>(
      'GetUsageResponsesByCheckService'
    );

    const responses = await getUsageResponsesByCheckService.execute(usageCheckId);
    const data = responses.map(r => r.toPrimitives());

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching usage responses:', error);
    return NextResponse.json(
      { error: 'Failed to load usage responses' },
      { status: 500 }
    );
  }
}