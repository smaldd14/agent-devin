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
    const { results: lists } = await c.env.DB.prepare(
      'SELECT * FROM shopping_lists ORDER BY created_at DESC'
    ).all();
    
    const typedLists = (lists as unknown) as ShoppingList[];
    
    // For each list, fetch its items
    const listsWithItems = await Promise.all(typedLists.map(async (list) => {
      const { results: items } = await c.env.DB.prepare(
        'SELECT * FROM shopping_list_items WHERE shopping_list_id = ?'
      ).bind(list.id).all();
      
      const typedItems = (items as unknown) as ShoppingListItem[];
      
      return {
        ...list,
        items: typedItems
      };
    }));
    
    return success(c, listsWithItems);
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
    const data = c.get('json') as z.infer<typeof addListItemSchema>;
    
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