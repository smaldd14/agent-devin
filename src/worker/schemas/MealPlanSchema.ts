import { z } from 'zod';

/**
 * Schema for a meal plan item (no id on input)
 */
export const MealPlanItemSchema = z.object({
  planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  recipeId: z.number(),
});

/**
 * Body schema for saving a weekly meal plan
 */
export const WeeklyPlanSaveSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  items: z.array(MealPlanItemSchema),
});

/**
 * Query schema for fetching a weekly meal plan
 */
export const WeeklyPlanQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export type MealPlanItemInput = z.infer<typeof MealPlanItemSchema>;
export type WeeklyPlanSaveInput = z.infer<typeof WeeklyPlanSaveSchema>;
export type WeeklyPlanQueryInput = z.infer<typeof WeeklyPlanQuerySchema>;