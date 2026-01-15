import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/src/shared/container';
import type { SessionRepository } from '@/src/modules/auth/infrastructure/SessionRepository';
import { handleApiError } from '@/app/lib/api-error-handler';
import { logger } from '@/src/shared/infrastructure/Logger';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('subsaurus_session')?.value;

    if (token) {
      const sessionRepository = container.resolve<SessionRepository>('SessionRepository');
      
      try {
        await sessionRepository.deleteByToken(token);
      } catch (error) {
        logger.debug('Session already deleted or not found', { token: token.substring(0, 8) + '...' });
      }
    }

    cookieStore.delete('subsaurus_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'logout', 'Logout failed');
  }
}

