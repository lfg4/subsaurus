
export class Transaction {
  constructor(
    public readonly date: Date,
    public readonly description: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly rawRow: Record<string, string | number>
  ) {}

  static create(data: {
    date: Date;
    description: string;
    amount: number;
    currency: string;
    rawRow: Record<string, string | number>;
  }): Transaction {
    if (!data.date || isNaN(data.date.getTime())) {
      throw new Error('Invalid date');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (isNaN(data.amount)) {
      throw new Error('Invalid amount');
    }

    return new Transaction(
      data.date,
      data.description.trim(),
      data.amount,
      data.currency || 'EUR',
      data.rawRow
    );
  }
   
  getNormalizedName(): string {
    return this.description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)[0];
  }

  isExpense(): boolean {
    return this.amount < 0;
  }

  getAbsoluteAmount(): number {
    return Math.abs(this.amount);
  }

  getDaysDifference(other: Transaction): number {
    const diff = Math.abs(this.date.getTime() - other.date.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  isSimilarTo(other: Transaction, tolerance: number = 0.1): boolean {
    if (this.getNormalizedName() !== other.getNormalizedName()) {
      return false;
    }

    const amountDiff = Math.abs(this.getAbsoluteAmount() - other.getAbsoluteAmount());
    const avgAmount = (this.getAbsoluteAmount() + other.getAbsoluteAmount()) / 2;
    
    return amountDiff / avgAmount <= tolerance;
  }
}

