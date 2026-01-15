import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/src/shared/container';
import type { ValidateSessionService } from '@/src/modules/auth/application/ValidateSession.service';
import { handleApiError, createUnauthorizedError } from '@/app/lib/api-error-handler';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('subsaurus_session')?.value;

    if (!token) {
      return createUnauthorizedError('No session found');
    }

    const validateSessionService = container.resolve<ValidateSessionService>(
      'ValidateSessionService'
    );

    const result = await validateSessionService.execute(token);

    if (!result.valid) {
      cookieStore.delete('subsaurus_session');
      
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: result.user!.id.toString(),
        slackUserId: result.user!.slackUserId,
        slackWorkspaceId: result.user!.slackWorkspaceId,
        displayName: result.user!.displayName,
        email: result.user!.email,
        avatarUrl: result.user!.avatarUrl,
        role: result.user!.role,
      },
    });
  } catch (error) {
    return handleApiError(error, 'validate session', 'Validation error');
  }
}

