// src/worker/routes/inventory.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createItemSchema,
  updateItemSchema,
  batchCreateItemsSchema,
  batchDeleteItemsSchema
} from '../controllers/inventory';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  batchCreateItems,
  deleteItem,
  batchDeleteItems
} from '../controllers/inventory';

import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllItems);
routes.get('/:id', getItemById);
routes.post('/', zValidator('json', createItemSchema), createItem);
routes.post('/batch', zValidator('json', batchCreateItemsSchema), batchCreateItems);
// Delete a single inventory item
routes.delete('/:id', deleteItem);
// Batch delete inventory items by IDs
routes.post('/batch-delete', zValidator('json', batchDeleteItemsSchema), batchDeleteItems);
// Update an inventory item
routes.put('/:id', zValidator('json', updateItemSchema), updateItem);

export const inventoryRoutes = routes;