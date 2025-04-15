import { Hono } from 'hono';
import { recipeRoutes } from './recipes';
import { inventoryRoutes } from './inventory';
import { shoppingListRoutes } from './shopping-lists';
import { AppType } from '../index';

export function setupRoutes(app: Hono<AppType>): void {
  app.route('/api/recipes', recipeRoutes);
  app.route('/api/inventory', inventoryRoutes);
  app.route('/api/shopping-lists', shoppingListRoutes);
}