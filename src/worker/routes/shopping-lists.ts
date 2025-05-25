import { Hono } from 'hono';
import {
  getAllLists,
  getListById,
  createList,
  addListItem,
  updateListItem,
  deleteListItem,
  deleteList,
  updateListItemSchema,
  createListSchema,
  addListItemSchema,
} from '../controllers/shopping-lists';
import { zValidator } from '@hono/zod-validator';

import { AppType } from '../index';
import { generateShoppingList } from '../controllers/shopping-lists-generate';
import { GenerateShoppingListRequestSchema } from '../schemas/ShoppingListSchema';

const routes = new Hono<AppType>();

routes.get('/', getAllLists);
// Generate shopping list for a recipe
routes.post(
  '/generate',
  zValidator('json', GenerateShoppingListRequestSchema),
  generateShoppingList
);
routes.get('/:id', getListById);
routes.post('/', zValidator('json', createListSchema), createList);
routes.post('/:id/items', zValidator('json', addListItemSchema), addListItem);
routes.patch(
  '/:id/items/:itemId',
  zValidator('json', updateListItemSchema),
  updateListItem
);
routes.delete('/:id/items/:itemId', deleteListItem);
routes.delete('/:id', deleteList);

export const shoppingListRoutes = routes;