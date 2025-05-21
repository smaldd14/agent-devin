import { useState, useEffect, useCallback } from 'react';
import type { WeeklyMealPlan } from '@/types/meal-plan';
import { getMealPlan, saveMealPlan } from '@services/meal-plans';

/**
 * Hook to manage a weekly meal plan for a given start date.
 */
export function useMealPlan(startDate: string) {
  const [items, setItems] = useState<WeeklyMealPlan>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing plan
  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await getMealPlan(startDate);
      setItems(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  // Initial load and refresh on startDate change
  useEffect(() => {
    if (startDate) {
      fetchPlan();
    }
  }, [startDate, fetchPlan]);

  /**
   * Update or remove an item locally.
   * @param planDate Date string YYYY-MM-DD
   * @param recipeId Recipe ID or null to clear
   */
  const updateItem = useCallback(
    (planDate: string, recipeId: number | null) => {
      setItems((prev) => {
        const exists = prev.find((i) => i.planDate === planDate);
        if (recipeId == null) {
          // remove
          return prev.filter((i) => i.planDate !== planDate);
        }
        if (exists) {
          return prev.map((i) =>
            i.planDate === planDate ? { ...i, recipeId } : i
          );
        }
        // add new (id will be assigned by backend)
        return [...prev, { id: 0, planDate, recipeId }];
      });
    }, []
  );

  /**
   * Save current plan to backend, then update with returned items (with IDs).
   */
  const savePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // prepare items without id
      const toSave = items.map(({ planDate, recipeId }) => ({ planDate, recipeId }));
      const saved = await saveMealPlan(startDate, toSave);
      setItems(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  }, [startDate, items]);

  return {
    items,
    loading,
    error,
    updateItem,
    savePlan,
    refetch: fetchPlan,
  } as const;
}