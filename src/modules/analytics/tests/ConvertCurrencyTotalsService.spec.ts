import { ConvertCurrencyTotalsService } from '../application/ConvertCurrencyTotalsService';
import type { ExchangeRateRepository } from '../infrastructure/ExchangeRateRepository';
import type { CurrencyTotal } from '../domain/types';

describe('ConvertCurrencyTotalsService', () => {
  let service: ConvertCurrencyTotalsService;
  let exchangeRateRepository: jest.Mocked<ExchangeRateRepository>;

  beforeEach(() => {
    exchangeRateRepository = {
      getRate: jest.fn(),
      saveRate: jest.fn(),
      getRatesByBaseCurrency: jest.fn(),
    } as any;

    service = new ConvertCurrencyTotalsService(exchangeRateRepository);
  });

  describe('execute', () => {
    it('should convert multiple currencies to target currency', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'EUR', totalMonthly: 100, subscriptionCount: 2 },
        { currency: 'USD', totalMonthly: 50, subscriptionCount: 1 },
      ];

      // Mock EUR to EUR (same currency, rate = 1)
      // Mock USD to EUR rate
      exchangeRateRepository.getRate.mockImplementation((from, to) => {
        if (from === 'USD' && to === 'EUR') {
          return Promise.resolve(0.92);
        }
        return Promise.resolve(null);
      });

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      expect(result.convertedTotal).toBe(146); // 100 + (50 * 0.92) = 146
      expect(result.targetCurrency).toBe('EUR');
    });

    it('should use fallback rates when repository returns null', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'USD', totalMonthly: 100, subscriptionCount: 1 },
      ];

      exchangeRateRepository.getRate.mockResolvedValue(null);

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      // Fallback rate USD to EUR is 0.92
      expect(result.convertedTotal).toBe(92); // 100 * 0.92
      expect(result.targetCurrency).toBe('EUR');
    });

    it('should return original amount when conversion fails and no fallback exists', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'JPY', totalMonthly: 1000, subscriptionCount: 1 },
      ];

      exchangeRateRepository.getRate.mockResolvedValue(null);

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      // No fallback for JPY, should return original amount
      expect(result.convertedTotal).toBe(1000);
      expect(result.targetCurrency).toBe('EUR');
    });

    it('should return same amount when converting to same currency', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'EUR', totalMonthly: 150.5, subscriptionCount: 3 },
      ];

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      expect(result.convertedTotal).toBe(150.5);
      expect(result.targetCurrency).toBe('EUR');
      expect(exchangeRateRepository.getRate).not.toHaveBeenCalled();
    });

    it('should round result to 2 decimal places', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'USD', totalMonthly: 33.333, subscriptionCount: 1 },
      ];

      exchangeRateRepository.getRate.mockImplementation((from, to) => {
        if (from === 'USD' && to === 'EUR') {
          return Promise.resolve(0.92);
        }
        return Promise.resolve(null);
      });

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      // 33.333 * 0.92 = 30.66636, rounded to 30.67
      expect(result.convertedTotal).toBe(30.67);
    });

    it('should handle empty currency totals', async () => {
      const result = await service.execute({
        currencyTotals: [],
        targetCurrency: 'EUR',
      });

      expect(result.convertedTotal).toBe(0);
      expect(result.targetCurrency).toBe('EUR');
    });

    it('should convert GBP to EUR using fallback rates', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'GBP', totalMonthly: 100, subscriptionCount: 2 },
      ];

      exchangeRateRepository.getRate.mockResolvedValue(null);

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      // Fallback rate GBP to EUR is 1.18
      expect(result.convertedTotal).toBe(118);
      expect(result.targetCurrency).toBe('EUR');
    });

    it('should handle mix of successful and failed conversions', async () => {
      const currencyTotals: CurrencyTotal[] = [
        { currency: 'EUR', totalMonthly: 100, subscriptionCount: 2 },
        { currency: 'USD', totalMonthly: 50, subscriptionCount: 1 },
        { currency: 'JPY', totalMonthly: 1000, subscriptionCount: 1 }, // No fallback
      ];

      exchangeRateRepository.getRate.mockImplementation((from, to) => {
        if (from === 'USD' && to === 'EUR') {
          return Promise.resolve(0.92);
        }
        return Promise.resolve(null);
      });

      const result = await service.execute({
        currencyTotals,
        targetCurrency: 'EUR',
      });

      // 100 (EUR) + 46 (USD*0.92) + 1000 (JPY fallback to original) = 1146
      expect(result.convertedTotal).toBe(1146);
    });
  });
});

