import { RenewalCycle } from '@/src/types/enums';
import { Transaction } from './Transaction';


export class SubscriptionPattern {
  constructor(
    public readonly name: string,
    public readonly transactions: Transaction[],
    public readonly suggestedCost: number,
    public readonly suggestedCurrency: string,
    public readonly suggestedCycle: RenewalCycle | null,
    public readonly suggestedRenewalDate: Date | null,
    public readonly confidence: number
  ) {}

  static detectPatterns(transactions: Transaction[]): SubscriptionPattern[] {
    const grouped = this.groupByName(transactions);

    const patterns: SubscriptionPattern[] = [];

    for (const [name, txs] of Object.entries(grouped)) {
      const expenses = txs.filter(t => t.isExpense());
      
      if (expenses.length < 2) {
        continue;
      }

      const pattern = this.analyzeGroup(name, expenses);
      
      if (pattern && pattern.confidence >= 50) {
        patterns.push(pattern);
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private static groupByName(transactions: Transaction[]): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};

    for (const tx of transactions) {
      const normalizedName = tx.getNormalizedName();
      if (!groups[normalizedName]) {
        groups[normalizedName] = [];
      }
      groups[normalizedName].push(tx);
    }

    return groups;
  }

  private static analyzeGroup(name: string, transactions: Transaction[]): SubscriptionPattern | null {
    if (transactions.length < 2) {
      return null;
    }

    const sorted = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i].getDaysDifference(sorted[i - 1]));
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    const cycle = this.detectCycle(avgInterval, stdDev);

    const amounts = sorted.map(t => t.getAbsoluteAmount());
    const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

    const confidence = this.calculateConfidence(sorted.length, avgInterval, stdDev);

    const lastDate = sorted[sorted.length - 1].date;
    const nextRenewalDate = cycle ? this.calculateNextRenewal(lastDate, cycle) : null;

    return new SubscriptionPattern(
      sorted[0].description,
      sorted,
      avgAmount,
      sorted[0].currency,
      cycle,
      nextRenewalDate,
      confidence
    );
  }

  private static detectCycle(avgInterval: number, stdDev: number): RenewalCycle | null {
    const tolerance = 5;

    if (Math.abs(avgInterval - 30) <= tolerance && stdDev < 10) {
      return RenewalCycle.MONTHLY;
    }

    if (Math.abs(avgInterval - 90) <= tolerance && stdDev < 15) {
      return RenewalCycle.QUARTERLY;
    }

    if (Math.abs(avgInterval - 180) <= tolerance && stdDev < 20) {
      return RenewalCycle.SEMESTRAL;
    }

    if (Math.abs(avgInterval - 365) <= tolerance && stdDev < 30) {
      return RenewalCycle.YEARLY;
    }

    return null;
  }

  private static calculateConfidence(
    transactionCount: number,
    avgInterval: number,
    stdDev: number
  ): number {
    let confidence = 0;

    // Más transacciones = más confianza (máx 40 puntos)
    confidence += Math.min(transactionCount * 10, 40);

    // Regularidad (baja desviación) = más confianza (máx 40 puntos)
    const regularity = Math.max(0, 40 - (stdDev / avgInterval) * 100);
    confidence += regularity;

    // Intervalo reconocible = más confianza (20 puntos)
    if (this.detectCycle(avgInterval, stdDev)) {
      confidence += 20;
    }

    return Math.min(Math.round(confidence), 100);
  }

  private static calculateNextRenewal(lastDate: Date, cycle: RenewalCycle): Date {
    const next = new Date(lastDate);

    switch (cycle) {
      case RenewalCycle.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case RenewalCycle.QUARTERLY:
        next.setMonth(next.getMonth() + 3);
        break;
      case RenewalCycle.SEMESTRAL:
        next.setMonth(next.getMonth() + 6);
        break;
      case RenewalCycle.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  /**
   * Formatea el patrón para mostrar en UI
   */
  toPreview(): {
    name: string;
    amount: string;
    cycle: string;
    nextRenewal: string;
    occurrences: number;
    confidence: string;
    transactions: Array<{ date: string; amount: number }>;
  } {
    const cycleLabels: Record<RenewalCycle, string> = {
      [RenewalCycle.MONTHLY]: 'Mensual',
      [RenewalCycle.QUARTERLY]: 'Trimestral',
      [RenewalCycle.SEMESTRAL]: 'Semestral',
      [RenewalCycle.YEARLY]: 'Anual',
      [RenewalCycle.CUSTOM]: 'Personalizado',
    };

    return {
      name: this.name,
      amount: `${this.suggestedCost.toFixed(2)} ${this.suggestedCurrency}`,
      cycle: this.suggestedCycle ? cycleLabels[this.suggestedCycle] : 'Desconocido',
      nextRenewal: this.suggestedRenewalDate
        ? this.suggestedRenewalDate.toLocaleDateString('es-ES')
        : 'N/A',
      occurrences: this.transactions.length,
      confidence: `${this.confidence}%`,
      transactions: this.transactions.map(t => ({
        date: t.date.toLocaleDateString('es-ES'),
        amount: t.getAbsoluteAmount(),
      })),
    };
  }
}

