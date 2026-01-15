
export enum UsageCheckStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
}

export enum UsageResponseType {
  YES = 'YES',
  NO = 'NO',
  LITTLE = 'LITTLE',
}

export enum RenewalCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMESTRAL = 'SEMESTRAL',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum SlackActionId {
  USAGE_RESPONSE_YES = 'usage_response_yes',
  USAGE_RESPONSE_NO = 'usage_response_no',
  USAGE_RESPONSE_LITTLE = 'usage_response_little',
}

