// src/worker/routes/inventory.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createItemSchema, updateItemSchema } from '../controllers/inventory';
import { getAllItems, getItemById, createItem, updateItem } from '../controllers/inventory';

import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllItems);
routes.get('/:id', getItemById);
routes.post('/', zValidator('json', createItemSchema), createItem);
routes.put('/:id', zValidator('json', updateItemSchema), updateItem);

export const inventoryRoutes = routes;