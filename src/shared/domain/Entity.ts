/**
 * Base class for entities
 * Provides identity equality based on ID
 */
export abstract class Entity<T> {
  protected constructor(public readonly id: T) {}

  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }
}

