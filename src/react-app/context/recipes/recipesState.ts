// src/react-app/context/recipes/recipesState.ts
import { useState, useCallback } from 'react';
import { Recipe, RecipeResponse, RecipesResponse } from '@/types/api';
import { getRecipes, getRecipeById } from '@/react-app/services/recipes';

// Define the state shape for recipes
export interface RecipesState {
  items: Recipe[];
  current: Recipe | null;
  isLoading: boolean;
  error: string | null;
}

// Define the actions for recipes
export interface RecipesActions {
  fetchRecipes: () => Promise<void>;
  fetchRecipe: (id: number) => Promise<void>;
  clearCurrentRecipe: () => void;
}

// Custom hook that manages recipes state and provides actions
export function useRecipesState(): [RecipesState, RecipesActions] {
  // Recipes state
  const [items, setItems] = useState<Recipe[]>([]);
  const [current, setCurrent] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all recipes
  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: RecipesResponse = await getRecipes();
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.error || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError('An error occurred while fetching recipes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single recipe by ID
  const fetchRecipe = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: RecipeResponse = await getRecipeById(id);
      
      if (response.success && response.data) {
        setCurrent(response.data);
      } else {
        setError(response.error || 'Failed to fetch recipe');
      }
    } catch (err) {
      setError('An error occurred while fetching the recipe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear the current recipe
  const clearCurrentRecipe = useCallback(() => {
    setCurrent(null);
  }, []);

  // Bundle state
  const state: RecipesState = {
    items,
    current,
    isLoading,
    error
  };

  // Bundle actions
  const actions: RecipesActions = {
    fetchRecipes,
    fetchRecipe,
    clearCurrentRecipe
  };

  return [state, actions];
}