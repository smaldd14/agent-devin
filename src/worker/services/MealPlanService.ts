import type { MealPlanItem } from '@/types/meal-plan';
import { MealPlanRepository } from '../repositories/MealPlanRepository';

/**
 * Service for managing weekly meal plans.
 */
export class MealPlanService {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  /**
   * Fetches the meal plan items for a week starting at the given date.
   * @param startDate ISO date string (YYYY-MM-DD) for the week start
   */
  async getWeeklyPlan(startDate: string): Promise<MealPlanItem[]> {
    return this.mealPlanRepo.getPlanByWeek(startDate);
  }

  /**
   * Saves a weekly meal plan, replacing any existing entries for that week.
   * @param startDate ISO date string (YYYY-MM-DD) for the week start
   * @param items Array of MealPlanItem (id ignored)
   */
  async saveWeeklyPlan(startDate: string, items: Omit<MealPlanItem, 'id'>[]): Promise<MealPlanItem[]> {
    // TODO: Consider transaction if D1 supports
    // Delete existing and insert new
    // Use repository's upsert method
    const toSave = items.map(item => ({ ...item }));
    await this.mealPlanRepo.upsertPlanItems(toSave as MealPlanItem[]);
    // Return the updated plan
    return this.getWeeklyPlan(startDate);
  }
}