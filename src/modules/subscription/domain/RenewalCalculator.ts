import { RenewalCycle } from '@/src/types/enums';


export class RenewalCalculator {

  static calculateNextRenewal(current: Date, cycle: RenewalCycle): Date {
    const next = new Date(current);

    switch (cycle) {
      case RenewalCycle.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case RenewalCycle.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
      case RenewalCycle.CUSTOM:
        next.setDate(next.getDate() + 30);
        break;
    }

    return next;
  }

  static calculatePeriodStart(renewalDate: Date, cycle: RenewalCycle): Date {
    const periodStart = new Date(renewalDate);

    switch (cycle) {
      case RenewalCycle.MONTHLY:
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case RenewalCycle.YEARLY:
        periodStart.setFullYear(periodStart.getFullYear() - 1);
        break;
      case RenewalCycle.CUSTOM:
        periodStart.setDate(periodStart.getDate() - 30);
        break;
    }

    return periodStart;
  }

  static calculateUsageCheckDate(renewalDate: Date): Date {
    const sendDate = new Date(renewalDate);
    sendDate.setDate(sendDate.getDate() - 7);
    return sendDate;
  }

  static calculateDaysUntilRenewal(renewalDate: Date): number {
    const now = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  static isExpiringSoon(renewalDate: Date, thresholdDays: number = 7): boolean {
    const daysUntil = this.calculateDaysUntilRenewal(renewalDate);
    return daysUntil >= 0 && daysUntil <= thresholdDays;
  }
}

