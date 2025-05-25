// src/react-app/services/shopping-lists.ts
import { fetchApi } from './api';
import type { ShoppingList, ShoppingListItem } from '@/types/api';

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
/**
 * Response payload for paginated shopping lists.
 */
export interface ShoppingListsPayload {
  lists: ShoppingList[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * Fetch paginated shopping lists.
 */
export async function getShoppingLists(
  page: number = 1,
  perPage: number = 10
): Promise<ShoppingListsPayload> {
  const response = await fetchApi<ShoppingListsPayload>('/shopping-lists', {
    method: 'GET',
    params: { page: page.toString(), perPage: perPage.toString() },
  });
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to fetch shopping lists');
}

/**
 * Fetch a single shopping list by ID.
 */
export async function getShoppingList(
  id: number
): Promise<ShoppingList> {
  const response = await fetchApi<ShoppingList>(`/shopping-lists/${id}`);
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to fetch shopping list');
}

/**
 * Add a new item to an existing shopping list.
 */
export async function addShoppingListItem(
  listId: number,
  item: NewShoppingListItem
): Promise<ShoppingListItem> {
  const response = await fetchApi<ShoppingListItem>(
    `/shopping-lists/${listId}/items`,
    {
      method: 'POST',
      body: JSON.stringify(item),
    }
  );
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to add shopping list item');
}

/**
 * Delete a shopping list by ID.
 */
export async function deleteShoppingList(id: number): Promise<void> {
  const response = await fetchApi<void>(`/shopping-lists/${id}`, {
    method: 'DELETE',
  });
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete shopping list');
  }
}

/**
 * Update an existing shopping list item.
 */
export async function updateShoppingListItem(
  listId: number,
  itemId: number,
  data: Partial<NewShoppingListItem>
): Promise<ShoppingListItem> {
  const response = await fetchApi<ShoppingListItem>(
    `/shopping-lists/${listId}/items/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error || 'Failed to update shopping list item');
}

/**
 * Delete an item from a shopping list.
 */
export async function deleteShoppingListItem(
  listId: number,
  itemId: number
): Promise<void> {
  const response = await fetchApi<void>(
    `/shopping-lists/${listId}/items/${itemId}`,
    {
      method: 'DELETE',
    }
  );
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete shopping list item');
  }
}