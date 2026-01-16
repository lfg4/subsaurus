import { prisma } from '@/src/lib/prisma';
import { ExchangeRate } from '../domain/ExchangeRate';

export class ExchangeRateRepository {
  async upsert(fromCurrency: string, toCurrency: string, rate: number): Promise<ExchangeRate> {
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
      update: { rate },
      create: {
        fromCurrency,
        toCurrency,
        rate,
      },
    });

    return ExchangeRate.fromPrimitives(exchangeRate);
  }

  async getRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    const exchangeRate = await prisma.exchangeRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
    });

    return exchangeRate?.rate ?? null;
  }

  async getAll(): Promise<ExchangeRate[]> {
    const rates = await prisma.exchangeRate.findMany();
    return rates.map(ExchangeRate.fromPrimitives);
  }
}