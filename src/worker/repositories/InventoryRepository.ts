import type { D1Database } from '@cloudflare/workers-types/2023-07-01';

/**
 * Repository for accessing inventory data.
 */
export class InventoryRepository {
  constructor(private db: D1Database) {}

  /**
   * Fetch all current inventory items (name, quantity, unit).
   */
  async getAllInventoryItems(): Promise<
    Array<{ item_name: string; quantity: number; unit: string }>
  > {
    const res = await this.db
      .prepare('SELECT item_name, quantity, unit FROM inventory_items')
      .all();
    // @ts-ignore
    return res.results;
  }
}