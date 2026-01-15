import type { SlackOAuthPort, SlackOAuthTokenResponse, SlackUserInfoDTO } from '../domain/ports/SlackOAuthPort';

export class SlackOAuthClient implements SlackOAuthPort {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string
  ) {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Slack OAuth configuration');
    }
  }

  async exchangeCodeForToken(code: string): Promise<SlackOAuthTokenResponse> {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<SlackUserInfoDTO> {
    const response = await fetch('https://slack.com/api/openid.connect.userInfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    return {
      ok: data.ok,
      sub: data.sub,
      teamId: data['https://slack.com/team_id'],
      userId: data['https://slack.com/user_id'],
      email: data.email,
      emailVerified: data.email_verified,
      name: data.name,
      picture: data.picture,
      givenName: data.given_name,
      familyName: data.family_name,
      locale: data.locale,
      teamName: data['https://slack.com/team_name'],
      error: data.error,
    };
  }

  static fromEnvironment(): SlackOAuthClient {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Slack OAuth environment variables');
    }

    return new SlackOAuthClient(clientId, clientSecret, redirectUri);
  }
}

