// src/react-app/hooks/useRecipes.ts
import { useEffect } from 'react';
import { useAppData } from '@/react-app/context/AppDataContext';

// Hook for fetching all recipes
export function useRecipes() {
  const { recipes } = useAppData();

  useEffect(() => {
    recipes.fetchRecipes();
  }, [recipes.fetchRecipes]);

  return {
    recipes: recipes.items,
    isLoading: recipes.isLoading,
    error: recipes.error,
    refetch: recipes.fetchRecipes,
  };
}

// Hook for fetching a single recipe by ID
export function useRecipe(id: number | null) {
  const { recipes } = useAppData();

  useEffect(() => {
    if (id) {
      recipes.fetchRecipe(id);
    } else {
      recipes.clearCurrentRecipe();
    }
    
    return () => {
      recipes.clearCurrentRecipe();
    };
  }, [id, recipes]);

  return {
    recipe: recipes.current,
    isLoading: recipes.isLoading,
    error: recipes.error,
    refetch: id ? () => recipes.fetchRecipe(id) : () => {},
  };
}