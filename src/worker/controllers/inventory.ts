// src/worker/controllers/inventory.ts
import { Context as HonoContext } from 'hono';
import { z } from 'zod';
import { success, error } from '../utils/response';
import { InventoryItem } from '@/types/api';
import { AppType } from '../index';

// Define a typed context that includes validation
type Context = HonoContext<AppType>;

// Define the raw item type for SQLite results
interface RawItem extends Omit<InventoryItem, 'restock_flag'> {
  restock_flag: number;
}

// Validation schemas
export const createItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  item_description: z.string().optional(),
  brand: z.string().optional(),
  storage_location: z.string().min(1, 'Storage location is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  minimum_quantity: z.number().optional(),
  expiry_date: z.string().optional(),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  unit_price: z.number().optional(),
  notes: z.string().optional(),
  restock_flag: z.boolean().default(false)
});

export type CreateItemRequest = z.infer<typeof createItemSchema>;

export const updateItemSchema = createItemSchema.partial();
export type UpdateItemRequest = z.infer<typeof updateItemSchema>;

// Controllers
export async function getAllItems(c: Context): Promise<Response> {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM inventory_items ORDER BY item_name'
    ).all();
    
    // Type the raw results - use a safe type cast 
    const rawItems = (results as unknown) as RawItem[];
    
    // Convert SQLite 0/1 to boolean
    const items = rawItems.map(item => ({
      ...item,
      restock_flag: item.restock_flag === 1
    })) as InventoryItem[];
    
    return success(c, items);
  } catch (err) {
    console.error('Error fetching inventory items:', err);
    return error(c, 'Failed to fetch inventory items');
  }
}

export async function getItemById(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    
    const item = await c.env.DB.prepare(
      'SELECT * FROM inventory_items WHERE id = ?'
    ).bind(id).first() as RawItem | null;
    
    if (!item) {
      return error(c, 'Item not found', 404);
    }
    
    // Convert SQLite 0/1 to boolean
    const parsedItem: InventoryItem = {
      ...item,
      restock_flag: item.restock_flag === 1
    };
    
    return success(c, parsedItem);
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    return error(c, 'Failed to fetch inventory item');
  }
}

export async function createItem(c: Context): Promise<Response> {
  try {
    // Get the validated JSON data
    const data = c.get('json') as CreateItemRequest;
    
    const result = await c.env.DB.prepare(`
      INSERT INTO inventory_items (
        item_name, category, subcategory, item_description, brand, 
        storage_location, quantity, unit, minimum_quantity, expiry_date, 
        purchase_date, unit_price, notes, restock_flag
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.item_name,
      data.category,
      data.subcategory || null,
      data.item_description || null,
      data.brand || null,
      data.storage_location,
      data.quantity,
      data.unit,
      data.minimum_quantity || null,
      data.expiry_date || null,
      data.purchase_date,
      data.unit_price || null,
      data.notes || null,
      data.restock_flag ? 1 : 0
    ).run();
    
    const itemId = result.meta.last_row_id;
    
    const item = await c.env.DB.prepare(
      'SELECT * FROM inventory_items WHERE id = ?'
    ).bind(itemId).first() as RawItem;
    
    // Convert SQLite 0/1 to boolean
    const parsedItem: InventoryItem = {
      ...item,
      restock_flag: item.restock_flag === 1
    };
    
    return success(c, parsedItem, 201);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    return error(c, 'Failed to create inventory item');
  }
}

export async function updateItem(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const data = c.get('json') as UpdateItemRequest;
    
    // Verify item exists
    const existingItem = await c.env.DB.prepare(
      'SELECT * FROM inventory_items WHERE id = ?'
    ).bind(id).first();
    
    if (!existingItem) {
      return error(c, 'Item not found', 404);
    }
    
    // Build update statement dynamically
    let updateQuery = 'UPDATE inventory_items SET ';
    const updateFields: string[] = [];
    const bindParams: any[] = [];
    
    // Add all fields that were provided
    Object.entries(data).forEach(([key, value]) => {
      updateFields.push(`${key} = ?`);
      
      // Convert boolean to 0/1 for SQLite
      if (key === 'restock_flag' && typeof value === 'boolean') {
        bindParams.push(value ? 1 : 0);
      } else {
        bindParams.push(value);
      }
    });
    
    // Add WHERE clause and ID
    updateQuery += updateFields.join(', ') + ' WHERE id = ?';
    bindParams.push(id);
    
    await c.env.DB.prepare(updateQuery).bind(...bindParams).run();
    
    // Fetch updated item
    const updatedItem = await c.env.DB.prepare(
      'SELECT * FROM inventory_items WHERE id = ?'
    ).bind(id).first() as RawItem;
    
    // Convert SQLite 0/1 to boolean
    const parsedItem: InventoryItem = {
      ...updatedItem,
      restock_flag: updatedItem.restock_flag === 1
    };
    
    return success(c, parsedItem);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    return error(c, 'Failed to update inventory item');
  }
}