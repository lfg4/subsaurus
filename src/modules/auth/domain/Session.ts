export interface SessionPrimitives {
  id: string;
  slackUserId: string;
  slackWorkspaceId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class Session {
  private constructor(
    private readonly _id: string,
    private readonly _slackUserId: string,
    private readonly _slackWorkspaceId: string,
    private readonly _token: string,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date
  ) {}

  get id(): string {
    return this._id;
  }

  get slackUserId(): string {
    return this._slackUserId;
  }

  get slackWorkspaceId(): string {
    return this._slackWorkspaceId;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  static create(
    id: string,
    slackUserId: string,
    slackWorkspaceId: string,
    token: string,
    expiresInDays: number
  ): Session {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    const createdAt = new Date();

    return new Session(id, slackUserId, slackWorkspaceId, token, expiresAt, createdAt);
  }

  static fromPrimitives(primitives: SessionPrimitives): Session {
    return new Session(
      primitives.id,
      primitives.slackUserId,
      primitives.slackWorkspaceId,
      primitives.token,
      primitives.expiresAt,
      primitives.createdAt
    );
  }

  toPrimitives(): SessionPrimitives {
    return {
      id: this._id,
      slackUserId: this._slackUserId,
      slackWorkspaceId: this._slackWorkspaceId,
      token: this._token,
      expiresAt: this._expiresAt,
      createdAt: this._createdAt,
    };
  }
}

