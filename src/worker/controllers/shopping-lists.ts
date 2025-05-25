import { Context as HonoContext } from 'hono';
import { AppType } from '../index';
import { z } from 'zod';
import { success, error } from '../utils/response';
import { ShoppingList, ShoppingListItem } from '@/types/api';

// Define the context type
type Context = HonoContext<AppType>;

// Validation schemas
// Schema for creating a new shopping list with optional batch items
export const createListSchema = z.object({
  items: z.array(
    z.object({
      item_name: z.string().min(1, 'Item name is required'),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      category: z.string().optional(),
      brand: z.string().optional(),
    })
  ).optional(),
});

export const addListItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional()
});

// Controllers
export async function getAllLists(c: Context): Promise<Response> {
  try {
    // Parse pagination query params
    const url = new URL(c.req.url);
    const pageParam = url.searchParams.get('page');
    const perPageParam = url.searchParams.get('perPage');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const perPage = perPageParam ? parseInt(perPageParam, 10) : 10;
    const offset = (page - 1) * perPage;

    // Total count
    const countRow = (await c.env.DB.prepare(
      'SELECT COUNT(*) AS count FROM shopping_lists'
    ).first()) as { count: number };
    const total = countRow?.count ?? 0;

    // Fetch paginated lists
    const { results: lists } = await c.env.DB.prepare(
      'SELECT * FROM shopping_lists ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(perPage, offset).all();
    const typedLists = lists as unknown as ShoppingList[];

    // Return paginated payload
    return success(c, {
      lists: typedLists,
      total,
      page,
      perPage,
    });
  } catch (err) {
    console.error('Error fetching shopping lists:', err);
    return error(c, 'Failed to fetch shopping lists');
  }
}

export async function getListById(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    
    const list = await c.env.DB.prepare(
      'SELECT * FROM shopping_lists WHERE id = ?'
    ).bind(id).first() as ShoppingList | null;
    
    if (!list) {
      return error(c, 'Shopping list not found', 404);
    }
    
    // Fetch items for this list
    const { results: items } = await c.env.DB.prepare(
      'SELECT * FROM shopping_list_items WHERE shopping_list_id = ?'
    ).bind(id).all();
    
    const typedItems = (items as unknown) as ShoppingListItem[];
    
    return success(c, {
      ...list,
      items: typedItems
    });
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    return error(c, 'Failed to fetch shopping list');
  }
}

export async function createList(c: Context): Promise<Response> {
  try {
    // Parse payload
    const data = (c.req as any).valid('json') as z.infer<typeof createListSchema>;
    // Create the shopping list
    const insertList = await c.env.DB.prepare(
      'INSERT INTO shopping_lists DEFAULT VALUES'
    ).run();
    const listId = insertList.meta.last_row_id;
    // If batch items provided, insert them
    if (data.items && data.items.length > 0) {
      const stmt = await c.env.DB.prepare(
        `INSERT INTO shopping_list_items (
          shopping_list_id, item_name, quantity, unit, category, brand
        ) VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const item of data.items) {
        await stmt.bind(
          listId,
          item.item_name,
          item.quantity || null,
          item.unit || null,
          item.category || null,
          item.brand || null
        ).run();
      }
    }
    // Fetch the created list
    const list = (await c.env.DB.prepare(
      'SELECT * FROM shopping_lists WHERE id = ?'
    ).bind(listId).first()) as ShoppingList;
    // Fetch its items
    const { results: items } = await c.env.DB.prepare(
      'SELECT * FROM shopping_list_items WHERE shopping_list_id = ?'
    ).bind(listId).all();
    const typedItems = items as unknown as ShoppingListItem[];
    return success(c, { ...list, items: typedItems }, 201);
  } catch (err) {
    console.error('Error creating shopping list:', err);
    return error(c, 'Failed to create shopping list');
  }
}

export async function addListItem(c: Context): Promise<Response> {
  try {
    const listId = c.req.param('id');
    const data = (c.req as any).valid('json') as z.infer<typeof addListItemSchema>;
    
    // Verify the list exists
    const list = await c.env.DB.prepare(
      'SELECT * FROM shopping_lists WHERE id = ?'
    ).bind(listId).first();
    
    if (!list) {
      return error(c, 'Shopping list not found', 404);
    }
    
    const result = await c.env.DB.prepare(
      `INSERT INTO shopping_list_items (
        shopping_list_id, item_name, quantity, unit, category, brand
      ) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      listId,
      data.item_name,
      data.quantity || null,
      data.unit || null,
      data.category || null,
      data.brand || null
    ).run();
    
    const itemId = result.meta.last_row_id;
    
    const item = await c.env.DB.prepare(
      'SELECT * FROM shopping_list_items WHERE id = ?'
    ).bind(itemId).first() as ShoppingListItem;
    
    return success(c, item, 201);
  } catch (err) {
    console.error('Error adding shopping list item:', err);
    return error(c, 'Failed to add shopping list item');
  }
}

// Schema for updating an existing shopping list item
export const updateListItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required').optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

// Update an existing shopping list item
export async function updateListItem(c: Context): Promise<Response> {
  try {
    const listId = c.req.param('id');
    const itemId = c.req.param('itemId');
    const data = (c.req as any).valid('json') as z.infer<typeof updateListItemSchema>;

    // Verify the item exists in the list
    const existing = await c.env.DB.prepare(
      'SELECT * FROM shopping_list_items WHERE id = ? AND shopping_list_id = ?'
    ).bind(itemId, listId).first() as ShoppingListItem | null;
    if (!existing) {
      return error(c, 'Shopping list item not found', 404);
    }

    // Build update query parts
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
    values.push(itemId);

    await c.env.DB.prepare(
      `UPDATE shopping_list_items SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM shopping_list_items WHERE id = ?'
    ).bind(itemId).first() as ShoppingListItem;
    return success(c, updated);
  } catch (err) {
    console.error('Error updating shopping list item:', err);
    return error(c, 'Failed to update shopping list item');
  }
}

// Delete an item from a shopping list
export async function deleteListItem(c: Context): Promise<Response> {
  try {
    const listId = c.req.param('id');
    const itemId = c.req.param('itemId');
    const result = await c.env.DB.prepare(
      'DELETE FROM shopping_list_items WHERE id = ? AND shopping_list_id = ?'
    ).bind(itemId, listId).run();
    if (result.meta.changes === 0) {
      return error(c, 'Shopping list item not found', 404);
    }
    return success(c, null, 204);
  } catch (err) {
    console.error('Error deleting shopping list item:', err);
    return error(c, 'Failed to delete shopping list item');
  }
}

// Delete a shopping list (and its items via cascade)
export async function deleteList(c: Context): Promise<Response> {
  try {
    const listId = c.req.param('id');
    const result = await c.env.DB.prepare(
      'DELETE FROM shopping_lists WHERE id = ?'
    ).bind(listId).run();
    if (result.meta.changes === 0) {
      return error(c, 'Shopping list not found', 404);
    }
    return success(c, null, 204);
  } catch (err) {
    console.error('Error deleting shopping list:', err);
    return error(c, 'Failed to delete shopping list');
  }
}