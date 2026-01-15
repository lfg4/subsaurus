import { SETTINGS_CONSTANTS } from './constants/SettingsConstants';

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
    this.validateWorkspaceId(_slackWorkspaceId);
    this.validateDaysBeforeRenewal(_daysBeforeRenewal);
  }

  private validateWorkspaceId(workspaceId: string): void {
    if (!workspaceId || workspaceId.trim().length === 0) {
      throw new Error('Workspace ID cannot be empty');
    }
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
    const min = SETTINGS_CONSTANTS.MIN_DAYS_BEFORE_RENEWAL;
    const max = SETTINGS_CONSTANTS.MAX_DAYS_BEFORE_RENEWAL;
    
    if (days < min || days > max) {
      throw new Error(`Days before renewal must be between ${min} and ${max}`);
    }
  }

  static create(
    workspaceId: string,
    daysBeforeRenewal: number = SETTINGS_CONSTANTS.DEFAULT_DAYS_BEFORE_RENEWAL
  ): AppSettings {
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

