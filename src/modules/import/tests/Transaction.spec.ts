import { Transaction } from '../domain/Transaction';

describe('Transaction', () => {
  describe('create', () => {
    it('should create transaction with valid data', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Netflix',
        amount: -15.99,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.date).toEqual(new Date('2025-01-01'));
      expect(transaction.description).toBe('Netflix');
      expect(transaction.amount).toBe(-15.99);
      expect(transaction.currency).toBe('EUR');
    });

    it('should handle positive amounts', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Income',
        amount: 1000,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.amount).toBe(1000);
    });

    it('should handle negative amounts', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Expense',
        amount: -50,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.amount).toBe(-50);
    });
  });

  describe('isExpense', () => {
    it('should return true for negative amounts', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Subscription',
        amount: -15.99,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.isExpense()).toBe(true);
    });

    it('should return false for positive amounts', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Income',
        amount: 1000,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.isExpense()).toBe(false);
    });

    it('should return false for zero amount', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Zero',
        amount: 0,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.isExpense()).toBe(false);
    });
  });

  describe('getAbsoluteAmount', () => {
    it('should return positive value for negative amount', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Expense',
        amount: -50,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.getAbsoluteAmount()).toBe(50);
    });

    it('should return same value for positive amount', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: 'Income',
        amount: 100,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.getAbsoluteAmount()).toBe(100);
    });
  });

  describe('normalization', () => {
    it('should trim whitespace from description', () => {
      const transaction = Transaction.create({
        date: new Date('2025-01-01'),
        description: '  Netflix  ',
        amount: -15.99,
        currency: 'EUR',
        rawRow: {},
      });

      expect(transaction.description).toBe('Netflix');
    });
  });

  describe('validation', () => {
    it('should throw error for empty description', () => {
      expect(() => {
        Transaction.create({
          date: new Date('2025-01-01'),
          description: '',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        });
      }).toThrow('Description cannot be empty');
    });

    it('should throw error for whitespace-only description', () => {
      expect(() => {
        Transaction.create({
          date: new Date('2025-01-01'),
          description: '   ',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        });
      }).toThrow('Description cannot be empty');
    });

    it('should throw error for invalid date', () => {
      expect(() => {
        Transaction.create({
          date: new Date('invalid'),
          description: 'Netflix',
          amount: -15.99,
          currency: 'EUR',
          rawRow: {},
        });
      }).toThrow('Invalid date');
    });

    it('should throw error for invalid amount', () => {
      expect(() => {
        Transaction.create({
          date: new Date('2025-01-01'),
          description: 'Netflix',
          amount: NaN,
          currency: 'EUR',
          rawRow: {},
        });
      }).toThrow('Invalid amount');
    });
  });
});

