import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/src/shared/container';
import type { SessionRepository } from '@/src/modules/auth/infrastructure/SessionRepository';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('subsaurus_session')?.value;

    if (token) {
      const sessionRepository = container.resolve<SessionRepository>('SessionRepository');
      
      try {
        await sessionRepository.deleteByToken(token);
      } catch (error) {
        console.log('Session already deleted or not found');
      }
    }

    cookieStore.delete('subsaurus_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

