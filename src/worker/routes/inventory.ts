// src/worker/routes/inventory.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  createItemSchema, 
  updateItemSchema, 
  batchCreateItemsSchema 
} from '../controllers/inventory';
import { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  batchCreateItems 
} from '../controllers/inventory';

import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllItems);
routes.get('/:id', getItemById);
routes.post('/', zValidator('json', createItemSchema), createItem);
routes.post('/batch', zValidator('json', batchCreateItemsSchema), batchCreateItems);
routes.put('/:id', zValidator('json', updateItemSchema), updateItem);

export const inventoryRoutes = routes;