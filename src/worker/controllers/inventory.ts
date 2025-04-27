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

// Schema for batch creation - array of items with limit
export const batchCreateItemsSchema = z.object({
  items: z.array(createItemSchema).min(1, 'At least one item is required').max(50, 'Maximum 50 items per batch')
});

export type CreateItemRequest = z.infer<typeof createItemSchema>;
export type BatchCreateItemsRequest = z.infer<typeof batchCreateItemsSchema>;

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
    // Retrieve the validated JSON data from the request
    // Retrieve validated request body (JSON) via zod-validator
    const data = (c.req as any).valid('json') as CreateItemRequest;
    console.log('Creating inventory item with data:', data);
    
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
    // Retrieve validated request body (JSON) via zod-validator
    const data = (c.req as any).valid('json') as UpdateItemRequest;
    
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

/**
 * Create multiple inventory items in a batch operation
 */
export async function batchCreateItems(c: Context): Promise<Response> {
  try {
    // Retrieve validated batch request body (JSON) via zod-validator
    const { items } = (c.req as any).valid('json') as BatchCreateItemsRequest;
    
    const createdItems: InventoryItem[] = [];
    const errors: Record<number, string> = {};
    let hasErrors = false;
    
    // Use D1's transaction API instead of raw SQL BEGIN TRANSACTION
    await c.env.DB.prepare('SELECT 1').first(); // Ensure connection is established
    
    const result = await c.env.DB.batch(items.map((item) => {
      return c.env.DB.prepare(`
        INSERT INTO inventory_items (
          item_name, category, subcategory, item_description, brand, 
          storage_location, quantity, unit, minimum_quantity, expiry_date, 
          purchase_date, unit_price, notes, restock_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        item.item_name,
        item.category,
        item.subcategory || null,
        item.item_description || null,
        item.brand || null,
        item.storage_location,
        item.quantity,
        item.unit,
        item.minimum_quantity || null,
        item.expiry_date || null,
        item.purchase_date,
        item.unit_price || null,
        item.notes || null,
        item.restock_flag ? 1 : 0
      );
    }));
    
    // Process results and fetch created items
    for (let i = 0; i < result.length; i++) {
      try {
        const insertResult = result[i];
        const itemId = insertResult.meta.last_row_id;
        
        // Fetch the created item
        const rawItem = await c.env.DB.prepare(
          'SELECT * FROM inventory_items WHERE id = ?'
        ).bind(itemId).first() as RawItem;
        
        // Convert SQLite 0/1 to boolean
        const parsedItem: InventoryItem = {
          ...rawItem,
          restock_flag: rawItem.restock_flag === 1
        };
        
        createdItems.push(parsedItem);
      } catch (err) {
        console.error(`Error processing result at index ${i}:`, err);
        errors[i] = `Failed to process item: ${(err as Error).message || 'Unknown error'}`;
        hasErrors = true;
      }
    }
    
    if (hasErrors && createdItems.length === 0) {
      // Complete failure
      return error(c, 'Failed to create any inventory items', 400, { errors });
    } else if (hasErrors) {
      // Partial success
      return success(c, { items: createdItems }, 207, { 
        message: 'Partially completed with errors',
        errors 
      }); // 207 Multi-Status
    } else {
      // Complete success
      return success(c, { items: createdItems }, 201);
    }
  } catch (err) {
    console.error('Error in batch create inventory items:', err);
    return error(c, 'Failed to process batch creation');
  }
}

// Schema for batch deletion of items by ID
export const batchDeleteItemsSchema = z.object({
  ids: z.array(z.number().int()).min(1, 'At least one id is required').max(50, 'Maximum 50 items per batch')
});
export type BatchDeleteItemsRequest = z.infer<typeof batchDeleteItemsSchema>;

// Controller to delete a single inventory item
export async function deleteItem(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    const result = await c.env.DB.prepare(
      'DELETE FROM inventory_items WHERE id = ?'
    ).bind(id).run();
    // Check that a row was deleted
    if ((result.meta as any).changes === 0) {
      return error(c, 'Item not found', 404);
    }
    return success(c, { id: Number(id) });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    return error(c, 'Failed to delete inventory item');
  }
}

// Controller to delete multiple inventory items in a batch
export async function batchDeleteItems(c: Context): Promise<Response> {
  try {
    const { ids } = (c.req as any).valid('json') as BatchDeleteItemsRequest;
    const deletedIds: number[] = [];
    const errors: Record<number, string> = {};
    let hasErrors = false;

    // Execute deletes in a single transaction
    const stmts = ids.map(id =>
      c.env.DB.prepare('DELETE FROM inventory_items WHERE id = ?').bind(id)
    );
    const results = await c.env.DB.batch(stmts);

    // Process results
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const id = ids[i];
      const changes = (res.meta as any).changes;
      if (changes && changes > 0) {
        deletedIds.push(id);
      } else {
        hasErrors = true;
        errors[id] = 'Item not found';
      }
    }

    if (hasErrors && deletedIds.length === 0) {
      return error(c, 'Failed to delete any inventory items', 400, { errors });
    } else if (hasErrors) {
      return success(c, { deleted: deletedIds }, 207, {
        message: 'Partially deleted with errors',
        errors
      });
    } else {
      return success(c, { deleted: deletedIds });
    }
  } catch (err) {
    console.error('Error in batch delete inventory items:', err);
    return error(c, 'Failed to process batch deletion');
  }
}