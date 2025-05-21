import { Hono } from 'hono';
import { recipeRoutes } from './recipes';
import { inventoryRoutes } from './inventory';
import { shoppingListRoutes } from './shopping-lists';
import { AppType } from '../index';
import { swipeRoutes } from './swipe';
import { mealPlanRoutes } from './meal-plans';

export function setupRoutes(app: Hono<AppType>): void {
  app.route('/api/recipes', recipeRoutes);
  app.route('/api/inventory', inventoryRoutes);
  app.route('/api/shopping-lists', shoppingListRoutes);
  // Recipe Swipe endpoints
  app.route('/api/swipe', swipeRoutes);
  // Meal plan endpoints
  app.route('/api/plans', mealPlanRoutes);
}