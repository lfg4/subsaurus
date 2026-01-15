export interface AppSettingsPrimitives {
  id: number;
  slackWorkspaceId: string;
  daysBeforeRenewal: number;
  isActive: boolean;
  updatedAt: Date;
}

export class AppSettings {
  private constructor(
    private readonly _id: number,
    private readonly _slackWorkspaceId: string,
    private _daysBeforeRenewal: number,
    private _isActive: boolean,
    private _updatedAt: Date
  ) {
    this.validateDaysBeforeRenewal(_daysBeforeRenewal);
  }

  get id(): number {
    return this._id;
  }

  get slackWorkspaceId(): string {
    return this._slackWorkspaceId;
  }

  get daysBeforeRenewal(): number {
    return this._daysBeforeRenewal;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  
  isWorkspaceActive(): boolean {
    return this._isActive;
  }

  updateDaysBeforeRenewal(days: number): void {
    this.validateDaysBeforeRenewal(days);
    this._daysBeforeRenewal = days;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  private validateDaysBeforeRenewal(days: number): void {
    if (days < 1 || days > 60) {
      throw new Error('Days before renewal must be between 1 and 60');
    }
  }

  static create(workspaceId: string, daysBeforeRenewal: number = 7): AppSettings {
    return new AppSettings(0, workspaceId, daysBeforeRenewal, true, new Date());
  }

  static fromPrimitives(primitives: AppSettingsPrimitives): AppSettings {
    return new AppSettings(
      primitives.id,
      primitives.slackWorkspaceId,
      primitives.daysBeforeRenewal,
      primitives.isActive,
      primitives.updatedAt
    );
  }

  toPrimitives(): AppSettingsPrimitives {
    return {
      id: this._id,
      slackWorkspaceId: this._slackWorkspaceId,
      daysBeforeRenewal: this._daysBeforeRenewal,
      isActive: this._isActive,
      updatedAt: this._updatedAt,
    };
  }
}

