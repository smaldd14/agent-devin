import type { Context as HonoContext } from 'hono';
import type { AppType } from '../index';
import { success, error } from '../utils/response';
import type { WeeklyPlanQueryInput, WeeklyPlanSaveInput } from '../schemas/MealPlanSchema';
import type { MealPlanItem } from '@/types/meal-plan';
import { MealPlanRepository } from '../repositories/MealPlanRepository';
import { MealPlanService } from '../services/MealPlanService';

// Context with env
type Context = HonoContext<AppType>;

/**
 * Controller: Get weekly meal plan
 */
export const getWeeklyPlan = async (c: Context): Promise<Response> => {
  try {
    const { startDate } = (c.req as any).valid('query') as WeeklyPlanQueryInput;
    const repo = new MealPlanRepository(c.env.DB);
    const service = new MealPlanService(repo);
    const items: MealPlanItem[] = await service.getWeeklyPlan(startDate);
    return success(c, { items }, 200);
  } catch (err: any) {
    console.error('Error fetching weekly plan:', err);
    return error(c, err instanceof Error ? err.message : 'Internal error', 500);
  }
};

/**
 * Controller: Save weekly meal plan
 */
export const saveWeeklyPlan = async (c: Context): Promise<Response> => {
  try {
    const body = (c.req as any).valid('json') as WeeklyPlanSaveInput;
    const { startDate, items: inputItems } = body;
    const repo = new MealPlanRepository(c.env.DB);
    const service = new MealPlanService(repo);
    const saved: MealPlanItem[] = await service.saveWeeklyPlan(startDate, inputItems);
    return success(c, { items: saved }, 200);
  } catch (err: any) {
    console.error('Error saving weekly plan:', err);
    return error(c, err instanceof Error ? err.message : 'Internal error', 500);
  }
};