import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/src/shared/container';
import type { ValidateSessionService } from '@/src/modules/auth/application/ValidateSession.service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('subsaurus_session')?.value;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No session found' },
        { status: 401 }
      );
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
    console.error('Error validating session:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation error' },
      { status: 500 }
    );
  }
}

