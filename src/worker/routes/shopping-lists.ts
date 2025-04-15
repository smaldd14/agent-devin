import { Hono } from 'hono';
import { 
  getAllLists, 
  getListById, 
  createList, 
  addListItem 
} from '../controllers/shopping-lists';
import { zValidator } from '@hono/zod-validator';
import { 
  createListSchema, 
  addListItemSchema 
} from '../controllers/shopping-lists';

import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllLists);
routes.get('/:id', getListById);
routes.post('/', zValidator('json', createListSchema), createList);
routes.post('/:id/items', zValidator('json', addListItemSchema), addListItem);

export const shoppingListRoutes = routes;