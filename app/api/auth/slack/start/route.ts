import { NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/api-error-handler';

export async function GET() {
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

    const state = Math.random().toString(36).substring(7);

    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('user_scope', userScopes); // user_scope en lugar de scope
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    return handleApiError(error, 'start OAuth flow', 'Failed to start authentication');
  }
}

