import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { ReSendUsageCheckService } from '@/src/modules/usage-tracking/application/ReSendUsageCheck.service';

export async function POST(
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

    const reSendUsageCheckService = container.resolve<ReSendUsageCheckService>('ReSendUsageCheckService');

    const result = await reSendUsageCheckService.execute({ checkId: id });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resending usage check:', error);
    return NextResponse.json(
      { 
        error: 'Failed to resend usage check',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

