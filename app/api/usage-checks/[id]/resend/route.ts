import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { ReSendUsageCheckService } from '@/src/modules/usage-tracking/application/ReSendUsageCheck.service';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return createValidationError('Invalid ID');
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
    return handleApiError(error, 'resend usage check', 'Failed to resend usage check');
  }
}

