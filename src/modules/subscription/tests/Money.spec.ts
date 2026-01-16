import { Money } from '../domain/Money';

describe('Money Value Object', () => {
  describe('constructor', () => {
    it('should create Money with valid values', () => {
      const money = new Money(100.50, 'EUR');
      
      expect(money.amount).toBe(100.50);
      expect(money.currency).toBe('EUR');
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-10, 'EUR')).toThrow('Amount cannot be negative');
    });

    it('should throw error for amount too large', () => {
      expect(() => new Money(9999999, 'EUR')).toThrow('Amount is too large');
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(100, 'EU')).toThrow('Currency must be a valid 3-letter code');
      expect(() => new Money(100, 'EURO')).toThrow('Currency must be a valid 3-letter code');
      expect(() => new Money(100, '')).toThrow('Currency must be a valid 3-letter code');
    });

    it('should accept zero amount', () => {
      const money = new Money(0, 'USD');
      expect(money.amount).toBe(0);
    });
  });

  describe('format', () => {
    it('should format EUR correctly', () => {
      const money = new Money(15.99, 'EUR');
      expect(money.format()).toBe('€15.99');
    });

    it('should format USD correctly', () => {
      const money = new Money(29.99, 'USD');
      expect(money.format()).toBe('$29.99');
    });

    it('should format GBP correctly', () => {
      const money = new Money(19.99, 'GBP');
      expect(money.format()).toBe('£19.99');
    });

    it('should show currency code for unknown currencies', () => {
      const money = new Money(100, 'JPY');
      expect(money.format()).toBe('JPY100.00');
    });

    it('should format with two decimal places', () => {
      const money = new Money(10, 'EUR');
      expect(money.format()).toBe('€10.00');
    });
  });

  describe('add', () => {
    it('should add money with same currency', () => {
      const money1 = new Money(10, 'EUR');
      const money2 = new Money(5, 'EUR');
      
      const result = money1.add(money2);
      
      expect(result.amount).toBe(15);
      expect(result.currency).toBe('EUR');
    });

    it('should throw error when adding different currencies', () => {
      const euro = new Money(10, 'EUR');
      const dollar = new Money(10, 'USD');
      
      expect(() => euro.add(dollar)).toThrow('Cannot add money with different currencies');
    });

    it('should not mutate original Money objects', () => {
      const money1 = new Money(10, 'EUR');
      const money2 = new Money(5, 'EUR');
      
      money1.add(money2);
      
      expect(money1.amount).toBe(10);
      expect(money2.amount).toBe(5);
    });

    it('should add decimal amounts correctly', () => {
      const money1 = new Money(10.50, 'EUR');
      const money2 = new Money(5.25, 'EUR');
      
      const result = money1.add(money2);
      
      expect(result.amount).toBe(15.75);
    });
  });

  describe('equals', () => {
    it('should return true for equal Money objects', () => {
      const money1 = new Money(10, 'EUR');
      const money2 = new Money(10, 'EUR');
      
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(10, 'EUR');
      const money2 = new Money(15, 'EUR');
      
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(10, 'EUR');
      const money2 = new Money(10, 'USD');
      
      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('fromPrimitives and toPrimitives', () => {
    it('should convert from and to primitives correctly', () => {
      const original = new Money(25.50, 'GBP');
      
      const primitives = original.toPrimitives();
      const restored = Money.fromPrimitives(primitives.amount, primitives.currency);
      
      expect(restored.amount).toBe(25.50);
      expect(restored.currency).toBe('GBP');
      expect(original.equals(restored)).toBe(true);
    });

    it('should preserve precision in primitives conversion', () => {
      const original = new Money(99.99, 'USD');
      
      const primitives = original.toPrimitives();
      
      expect(primitives.amount).toBe(99.99);
      expect(primitives.currency).toBe('USD');
    });
  });
});

