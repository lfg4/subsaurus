import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetUsageCheckByIdService } from '@/src/modules/usage-tracking/application/GetUsageCheckById.service';
import { handleApiError, createValidationError, createNotFoundError } from '@/app/lib/api-error-handler';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return createValidationError('Invalid ID');
    }

    const getUsageCheckByIdService = container.resolve<GetUsageCheckByIdService>(
      'GetUsageCheckByIdService'
    );

    const usageCheck = await getUsageCheckByIdService.execute(id);

    if (!usageCheck) {
      return createNotFoundError('Usage check');
    }

    return NextResponse.json(usageCheck.toPrimitives());
  } catch (error) {
    return handleApiError(error, 'fetch usage check', 'Failed to fetch usage check');
  }
}
