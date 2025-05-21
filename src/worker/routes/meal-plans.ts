import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../index';
import { getWeeklyPlan, saveWeeklyPlan } from '../controllers/meal-plans';
import { WeeklyPlanQuerySchema, WeeklyPlanSaveSchema } from '../schemas/MealPlanSchema';

/**
 * Routes for meal planning
 */
export const mealPlanRoutes = new Hono<AppType>()
  // Fetch a weekly plan by startDate query parameter
  .get(
    '/',
    zValidator('query', WeeklyPlanQuerySchema),
    getWeeklyPlan
  )
  // Save or update a weekly plan
  .post(
    '/',
    zValidator('json', WeeklyPlanSaveSchema),
    saveWeeklyPlan
  );