import { ExchangeRateRepository } from '@/src/modules/analytics/infrastructure/ExchangeRateRepository';

export class CurrencyConverter {
  private static repository = new ExchangeRateRepository();

  private static readonly fallbackRates: Record<string, Record<string, number>> = {
    EUR: { EUR: 1, USD: 1.09, GBP: 0.85 },
    USD: { EUR: 0.92, USD: 1, GBP: 0.78 },
    GBP: { EUR: 1.18, USD: 1.28, GBP: 1 },
  };

  static async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    let rate = await this.repository.getRate(fromCurrency, toCurrency);
    
    if (!rate) {
      rate = this.fallbackRates[fromCurrency]?.[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }
    }

    return amount * rate;
  }

  static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
    return symbols[currency] || currency;
  }
}