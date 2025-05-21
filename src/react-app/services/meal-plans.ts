// src/react-app/services/meal-plans.ts
import { fetchApi } from '@services/api';
import type { WeeklyMealPlan } from '@/types/meal-plan';

/**
 * Fetch the weekly meal plan for a given start date (YYYY-MM-DD).
 */
export async function getMealPlan(
  startDate: string
): Promise<WeeklyMealPlan> {
  const response = await fetchApi<{ items: WeeklyMealPlan }>(
    '/plans',
    { method: 'GET', params: { startDate } }
  );
  if (response.success && response.data) {
    return response.data.items;
  }
  throw new Error(response.error || 'Failed to fetch meal plan');
}

/**
 * Save or update the weekly meal plan for a given start date.
 */
export async function saveMealPlan(
  startDate: string,
  items: Omit<WeeklyMealPlan[number], 'id'>[]
): Promise<WeeklyMealPlan> {
  const response = await fetchApi<{ items: WeeklyMealPlan }>(
    '/plans',
    { method: 'POST', body: JSON.stringify({ startDate, items }) }
  );
  if (response.success && response.data) {
    return response.data.items;
  }
  throw new Error(response.error || 'Failed to save meal plan');
}