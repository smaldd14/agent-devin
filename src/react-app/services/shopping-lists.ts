// src/react-app/services/shopping-lists.ts
import { fetchApi } from './api';
import type { ShoppingList } from '@/types/api';

/**
 * Payload for creating shopping list items in batch.
 */
export interface NewShoppingListItem {
  item_name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  brand?: string;
}

/**
 * Create a new shopping list, optionally with items in one call.
 * Returns the created ShoppingList with its items.
 */
export async function createShoppingListWithItems(
  items: NewShoppingListItem[]
): Promise<ShoppingList> {
  const response = await fetchApi<ShoppingList>('/shopping-lists', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to create shopping list');
}