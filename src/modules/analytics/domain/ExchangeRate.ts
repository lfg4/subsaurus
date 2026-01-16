export class ExchangeRate {
  constructor(
    public readonly id: string,
    public readonly fromCurrency: string,
    public readonly toCurrency: string,
    public readonly rate: number,
    public readonly updatedAt: Date
  ) {}

  static create(fromCurrency: string, toCurrency: string, rate: number): ExchangeRate {
    return new ExchangeRate('', fromCurrency, toCurrency, rate, new Date());
  }

  static fromPrimitives(data: {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    updatedAt: Date;
  }): ExchangeRate {
    return new ExchangeRate(
      data.id,
      data.fromCurrency,
      data.toCurrency,
      data.rate,
      data.updatedAt
    );
  }
}