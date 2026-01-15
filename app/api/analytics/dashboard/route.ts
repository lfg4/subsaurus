import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetDashboardStatsService } from '@/src/modules/analytics/application/GetDashboardStats.service';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return createValidationError('Workspace ID is required');
    }

    const getDashboardStatsService = container.resolve<GetDashboardStatsService>(
      'GetDashboardStatsService'
    );

    const stats = await getDashboardStatsService.execute(workspaceId);

    return NextResponse.json(stats.toPrimitives());
  } catch (error) {
    return handleApiError(error, 'fetch dashboard stats', 'Failed to fetch dashboard statistics');
  }
}