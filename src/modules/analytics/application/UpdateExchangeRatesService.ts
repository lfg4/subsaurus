import { ExchangeRateRepository } from '../infrastructure/ExchangeRateRepository';
import { prisma } from '@/src/lib/prisma';

interface ExchangeRateResponse {
  conversion_rates: Record<string, number>;
}

export class UpdateExchangeRatesService {
  private readonly apiKey = process.env.EXCHANGE_RATE_API_KEY;
  
  constructor(private readonly repository: ExchangeRateRepository) {}

  async execute(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY not configured');
    }

    const activeCurrencies = await this.getActiveCurrencies();
    
    if (activeCurrencies.length === 0) {
      return;
    }

    for (const baseCurrency of activeCurrencies) {
      const rates = await this.fetchRates(baseCurrency);
      await this.saveRates(baseCurrency, rates, activeCurrencies);
    }
  }

  private async getActiveCurrencies(): Promise<string[]> {
  const subscriptions = await prisma.subscription.findMany({
    select: { costCurrency: true },
  });
  
  const uniqueCurrencies = [...new Set(
    subscriptions
      .map(s => s.costCurrency)
      .filter((currency): currency is string => currency !== null && currency !== undefined)
  )];
  
  return uniqueCurrencies;
}

  private async fetchRates(baseCurrency: string): Promise<Record<string, number>> {
    const url = `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${baseCurrency}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch rates for ${baseCurrency}: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    return data.conversion_rates;
  }

  private async saveRates(
    fromCurrency: string, 
    rates: Record<string, number>,
    activeCurrencies: string[]
  ): Promise<void> {
    const targetCurrencies = activeCurrencies.filter(c => c !== fromCurrency);
    
    for (const toCurrency of targetCurrencies) {
      const rate = rates[toCurrency];
      if (rate) {
        await this.repository.upsert(fromCurrency, toCurrency, rate);
      }
    }
  }
}