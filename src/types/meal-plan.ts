// Shared types for weekly meal planning

/**
 * Represents a single meal plan item for a specific date.
 */
export interface MealPlanItem {
  /** Unique identifier for the meal plan entry */
  id: number;
  /** Date for the planned meal in YYYY-MM-DD format */
  planDate: string;
  /** Reference to a recipe id */
  recipeId: number;
}

/**
 * A collection of MealPlanItems for a week.
 */
export type WeeklyMealPlan = MealPlanItem[];