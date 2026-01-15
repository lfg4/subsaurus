import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { AuthenticateUserService } from '@/src/modules/auth/application/AuthenticateUser.service';
import { cookies } from 'next/headers';
import { logger } from '@/src/shared/infrastructure/Logger';
import { strictRateLimit } from '@/app/lib/rate-limit';

export async function GET(request: Request) {
  const rateLimited = await strictRateLimit(request);
  if (rateLimited) {
    return NextResponse.redirect(
      new URL(`/login?error=rate_limit`, request.url)
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const receivedState = searchParams.get('state');

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=access_denied`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=missing_code`, request.url)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    
    if (!receivedState || !storedState || receivedState !== storedState) {
      logger.warn('OAuth CSRF attempt detected', { 
        hasReceivedState: !!receivedState,
        hasStoredState: !!storedState,
        statesMatch: receivedState === storedState,
      });
      
      cookieStore.delete('oauth_state');
      
      return NextResponse.redirect(
        new URL(`/login?error=invalid_state`, request.url)
      );
    }
    
    cookieStore.delete('oauth_state');

    const authenticateUserService = container.resolve<AuthenticateUserService>(
      'AuthenticateUserService'
    );

    const result = await authenticateUserService.execute(code);

    if (!result.success || !result.sessionToken) {
      const errorParam = result.error || 'authentication_failed';
      return NextResponse.redirect(
        new URL(`/login?error=${errorParam}`, request.url)
      );
    }

    const response = NextResponse.redirect(new URL('/', request.url));

    response.cookies.set('subsaurus_session', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Error in OAuth callback', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(
      new URL(`/login?error=server_error`, request.url)
    );
  }
}

