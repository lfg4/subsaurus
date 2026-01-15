import { NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/api-error-handler';
import { strictRateLimit } from '@/app/lib/rate-limit';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
  const rateLimited = await strictRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.SLACK_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      );
    }

    const userScopes = [
      'openid',
      'profile',
      'email',
    ].join(',');

    const state = randomBytes(32).toString('hex');

    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('user_scope', userScopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(authUrl.toString());
    
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'start OAuth flow', 'Failed to start authentication');
  }
}

