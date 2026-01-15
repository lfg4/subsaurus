export interface SlackOAuthTokenResponse {
  ok: boolean;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    access_token?: string;
    scope?: string;
    token_type?: string;
  };
  error?: string;
}

export interface SlackUserInfoDTO {
  ok: boolean;
  sub?: string;
  teamId?: string;
  userId?: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  locale?: string;
  teamName?: string;
  error?: string;
}


export interface SlackOAuthPort {
  exchangeCodeForToken(code: string): Promise<SlackOAuthTokenResponse>;
  getUserInfo(accessToken: string): Promise<SlackUserInfoDTO>;
}

