import type { D1Database } from '@cloudflare/workers-types/2023-07-01';
import type { MealPlanItem } from '@/types/meal-plan';

/**
 * Repository for storing and retrieving weekly meal plans.
 */
export class MealPlanRepository {
  constructor(private db: D1Database) {}

  /**
   * Fetch all MealPlanItems for a given week starting at startDate (inclusive).
   * @param startDate ISO date string (YYYY-MM-DD) for Monday of the week
   */
  async getPlanByWeek(startDate: string): Promise<MealPlanItem[]> {
    // Calculate week end date as startDate + 6 days
    const query = `
      SELECT id,
             plan_date AS planDate,
             recipe_id AS recipeId
      FROM meal_plans
      WHERE plan_date >= ?
        AND plan_date <= date(?, '+6 days')
      ORDER BY plan_date
    `;
    const res = await this.db.prepare(query)
      .bind(startDate, startDate)
      .all();
    // D1 returns rows in results
    return (res.results as any[]).map(row => ({
      id: row.id,
      planDate: row.planDate,
      recipeId: row.recipeId,
    }));
  }

  /**
   * Replace existing plan items for the given dates with the provided items.
   * @param items Array of MealPlanItem; id property will be ignored on insert.
   */
  async upsertPlanItems(items: MealPlanItem[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    // Extract unique dates for deletion
    const dates = Array.from(new Set(items.map(i => i.planDate)));
    // Delete existing entries for these dates
    const placeholders = dates.map(() => '?').join(',');
    const deleteSql = `DELETE FROM meal_plans WHERE plan_date IN (${placeholders})`;
    await this.db.prepare(deleteSql).bind(...dates).run();
    // Insert new items
    for (const item of items) {
      await this.db.prepare(
        'INSERT INTO meal_plans (plan_date, recipe_id) VALUES (?, ?)'
      )
      .bind(item.planDate, item.recipeId)
      .run();
    }
  }
}