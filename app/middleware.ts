import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { container } from '@/src/shared/container';
import type { ValidateSessionService } from '@/src/modules/auth/application/ValidateSession.service';
import { isDevelopmentMode } from '@/app/lib/dev-mode';

const publicPaths = [
  '/login',
  '/api/auth/slack/start',
  '/api/auth/slack/callback',
  '/api/slack',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDevelopmentMode) {
    return NextResponse.next();
  }

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('subsaurus_session')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const validateSessionService = container.resolve<ValidateSessionService>(
      'ValidateSessionService'
    );
    
    const result = await validateSessionService.execute(token);
    
    if (!result.valid) {
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
        response.cookies.delete('subsaurus_session');
        return response;
      }
      
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('subsaurus_session');
      return response;
    }
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Session validation failed' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-token', token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

