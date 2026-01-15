import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetUsageResponsesByCheckService } from '@/src/modules/usage-tracking/application/GetUsageResponsesByCheck.service';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const usageCheckId = parseInt(idStr);

    if (Number.isNaN(usageCheckId)) {
      return createValidationError('Invalid usage check ID');
    }

    const getUsageResponsesByCheckService = container.resolve<GetUsageResponsesByCheckService>(
      'GetUsageResponsesByCheckService'
    );

    const responses = await getUsageResponsesByCheckService.execute(usageCheckId);
    const data = responses.map(r => r.toPrimitives());

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'fetch usage responses', 'Failed to load usage responses');
  }
}