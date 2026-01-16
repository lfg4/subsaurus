import { schedules } from '@trigger.dev/sdk/v3';
import { ExchangeRateRepository } from '@/src/modules/analytics/infrastructure/ExchangeRateRepository';
import { UpdateExchangeRatesService } from '@/src/modules/analytics/application/UpdateExchangeRatesService';
import { logger } from '@/src/shared/infrastructure/Logger';

export const updateExchangeRates = schedules.task({
  id: 'update-exchange-rates',
  cron: '0 2 * * *',
  run: async () => {
    logger.info('Starting exchange rates update job');

    try {
      const repository = new ExchangeRateRepository();
      const service = new UpdateExchangeRatesService(repository);

      await service.execute();

      logger.info('Exchange rates updated successfully');

      return { success: true, updatedAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Failed to update exchange rates', { error });
      throw error;
    }
  },
});