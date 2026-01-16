import type { ExchangeRateRepository } from '../infrastructure/ExchangeRateRepository';
import type { CurrencyTotal } from '../domain/types';

interface ConvertCurrencyTotalsRequest {
  currencyTotals: CurrencyTotal[];
  targetCurrency: string;
}

interface ConvertCurrencyTotalsResponse {
  convertedTotal: number;
  targetCurrency: string;
}

export class ConvertCurrencyTotalsService {
  private readonly fallbackRates: Record<string, Record<string, number>> = {
    EUR: { EUR: 1, USD: 1.09, GBP: 0.85 },
    USD: { EUR: 0.92, USD: 1, GBP: 0.78 },
    GBP: { EUR: 1.18, USD: 1.28, GBP: 1 },
  };

  constructor(private exchangeRateRepository: ExchangeRateRepository) {}

  async execute(request: ConvertCurrencyTotalsRequest): Promise<ConvertCurrencyTotalsResponse> {
    const { currencyTotals, targetCurrency } = request;
    let total = 0;
    
    for (const currencyTotal of currencyTotals) {
      try {
        const converted = await this.convertAmount(
          currencyTotal.totalMonthly,
          currencyTotal.currency,
          targetCurrency
        );
        total += converted;
      } catch {
        // Si falla la conversión, se suma el monto original
        total += currencyTotal.totalMonthly;
      }
    }
    
    return {
      convertedTotal: Math.round(total * 100) / 100,
      targetCurrency,
    };
  }

  private async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    let rate = await this.exchangeRateRepository.getRate(fromCurrency, toCurrency);
    
    if (!rate) {
      rate = this.fallbackRates[fromCurrency]?.[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }
    }

    return amount * rate;
  }
}

