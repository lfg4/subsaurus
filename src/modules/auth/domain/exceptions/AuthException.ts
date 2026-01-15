
export abstract class AuthException extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class OAuthFailedException extends AuthException {
  constructor() {
    super('Failed to authenticate with Slack', 'oauth_failed');
  }
}

export class UserInfoFailedException extends AuthException {
  constructor() {
    super('Failed to get user information from Slack', 'user_info_failed');
  }
}

export class WorkspaceNotRegisteredException extends AuthException {
  constructor(public readonly workspaceId: string) {
    super(
      'Your Slack workspace is not registered in Subsaurus. Contact your organization admin.',
      'workspace_not_found'
    );
  }
}

export class WorkspaceInactiveException extends AuthException {
  constructor(public readonly workspaceId: string) {
    super(
      'Your workspace access has been disabled. Contact support.',
      'workspace_inactive'
    );
  }
}

export class UserNotRegisteredException extends AuthException {
  constructor(public readonly slackUserId: string) {
    super(
      'User not registered. Contact your workspace admin.',
      'user_not_found'
    );
  }
}

export class UserInactiveException extends AuthException {
  constructor(public readonly slackUserId: string) {
    super(
      'Your account has been disabled. Contact support.',
      'user_inactive'
    );
  }
}

export class AdminRoleRequiredException extends AuthException {
  constructor(public readonly slackUserId: string) {
    super(
      'Only workspace admins can access Subsaurus. Contact your admin to request access.',
      'admin_required'
    );
  }
}

export class SessionNotFoundException extends AuthException {
  constructor() {
    super('Session not found or expired', 'session_not_found');
  }
}

export class SessionExpiredException extends AuthException {
  constructor() {
    super('Session has expired', 'session_expired');
  }
}

