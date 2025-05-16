import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../index';
import {
  createSwipeSessionSchema,
  getNextRecipe,
  postSwipeSession,
  postSwipeAction,
  nextRecipeQuerySchema,
  swipeActionSchema,
  swipeUndoSchema,
  postSwipeUndo,
} from '../controllers/swipe';

/**
 * Router for Recipe Swipe feature
 */
const routes = new Hono<AppType>();

// Start a new swipe session
routes.post(
  '/session',
  zValidator('json', createSwipeSessionSchema),
  postSwipeSession,
);

// Get next recipe card to swipe on
routes.get(
  '/next',
  zValidator('query', nextRecipeQuerySchema),
  getNextRecipe,
);

// Record swipe action (like or skip)
routes.post(
  '/action',
  zValidator('json', swipeActionSchema),
  postSwipeAction,
);
// Undo last swipe action
routes.post(
  '/undo',
  zValidator('json', swipeUndoSchema),
  postSwipeUndo,
);

export const swipeRoutes = routes;