import { DetectSubscriptionsService } from '../application/DetectSubscriptions.service';
import { Transaction } from '../domain/Transaction';

describe('DetectSubscriptionsService', () => {
  let service: DetectSubscriptionsService;

  beforeEach(() => {
    service = new DetectSubscriptionsService();
  });

  describe('execute', () => {
    it('should detect monthly recurring transactions', async () => {
      const baseDate = new Date('2025-01-01');
      const transactions = [
        Transaction.create({
          date: new Date('2025-01-01'),
          description: 'Netflix Subscription',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-02-01'),
          description: 'Netflix Subscription',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-03-01'),
          description: 'Netflix Subscription',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        }),
      ];

      const result = await service.detectPatterns(transactions);

      expect(result.length).toBeGreaterThan(0);
      const netflixPattern = result.find(p => 
        p.name.toLowerCase().includes('netflix')
      );
      expect(netflixPattern).toBeDefined();
    });

    it('should not detect non-recurring transactions', async () => {
      const transactions = [
        Transaction.create({
          date: new Date('2025-01-01'),
          description: 'Random Purchase',
          amount: -50,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-02-15'),
          description: 'Another Random Thing',
          amount: -30,
          currency: 'EUR',
          rawRow: {},
        }),
      ];

      const result = await service.detectPatterns(transactions);

      expect(result.length).toBe(0);
    });

    it('should group similar descriptions', async () => {
      const transactions = [
        Transaction.create({
          date: new Date('2025-01-01'),
          description: 'SPOTIFY AB',
          amount: -9.99,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-02-01'),
          description: 'SPOTIFY AB',
          amount: -9.99,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-03-01'),
          description: 'SPOTIFY AB',
          amount: -9.99,
          currency: 'EUR',
          rawRow: {},
        }),
      ];

      const result = await service.detectPatterns(transactions);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty transaction list', async () => {
      const result = await service.detectPatterns([]);

      expect(result).toEqual([]);
    });

    it('should filter positive amounts', async () => {
      const transactions = [
        Transaction.create({
          date: new Date('2025-01-01'),
          description: 'Income',
          amount: 1000,
          currency: 'EUR',
          rawRow: {},
        }),
        Transaction.create({
          date: new Date('2025-02-01'),
          description: 'Income',
          amount: 1000,
          currency: 'EUR',
          rawRow: {},
        }),
      ];

      const result = await service.detectPatterns(transactions);

      expect(result.length).toBe(0);
    });
  });
});

