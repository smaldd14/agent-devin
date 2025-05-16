import type { D1Database } from '@cloudflare/workers-types/2023-07-01';
import type { MissingItem } from '../schemas/ShoppingListSchema';

/**
 * Repository for persisting shopping lists and items.
 */
export class ShoppingListRepository {
  constructor(private db: D1Database) {}

  /**
   * Create a new shopping list record.
   * @param source - origin of the list (e.g., 'llm-delta')
   * @returns the new shoppingListId
   */
  async createShoppingList(source: string): Promise<number> {
    const result = await this.db
      .prepare(
        'INSERT INTO shopping_lists (amazon_link, source) VALUES (?, ?)'
      )
      .bind(null, source)
      .run();
    return result.meta.last_row_id as number;
  }

  /**
   * Bulk insert items for a shopping list.
   */
  async addItems(
    shoppingListId: number,
    items: MissingItem[]
  ): Promise<void> {
    const stmts = items.map((item) =>
      this.db
        .prepare(
          'INSERT INTO shopping_list_items (shopping_list_id, item_name, quantity, unit, brand, category) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(
          shoppingListId,
          item.itemName,
          item.quantity,
          item.unit,
          item.brand,
          null
        )
    );
    await this.db.batch(stmts);
  }
}