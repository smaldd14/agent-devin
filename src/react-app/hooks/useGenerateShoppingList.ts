import { useState, useCallback } from 'react';
import { fetchApi } from '@services/api';
import type { ShoppingListItem, GenerateShoppingListResponse } from '@/types/shopping-list';

/**
 * Hook to generate a shopping list for one or more recipes via backend API.
 */
export function useGenerateShoppingList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ShoppingListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Invoke API to generate shopping list.
   * @param recipeIds Array of recipe identifiers
   */
  const generate = useCallback(async (recipeIds: number[]) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await fetchApi<GenerateShoppingListResponse>(
        '/shopping-lists/generate',
        {
          method: 'POST',
          body: JSON.stringify({ recipeIds }),
        }
      );
      if (response.success && response.data) {
        setData(response.data.items);
      } else {
        setError(response.error || 'Failed to generate shopping list');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, data, loading, error } as const;
}