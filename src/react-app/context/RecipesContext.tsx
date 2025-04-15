// src/react-app/context/RecipesContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Recipe, RecipeResponse, RecipesResponse } from '@/types/api';
import { getRecipes, getRecipeById } from '@/react-app/services/recipes';

interface RecipesContextType {
  recipes: Recipe[];
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  fetchRecipe: (id: number) => Promise<void>;
  clearRecipe: () => void;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: RecipesResponse = await getRecipes();
      
      if (response.success && response.data) {
        setRecipes(response.data);
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

  const fetchRecipe = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    
    try {
      const response: RecipeResponse = await getRecipeById(id);
      
      if (response.success && response.data) {
        setRecipe(response.data);
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

  const clearRecipe = useCallback(() => {
    setRecipe(null);
  }, []);

  const value = {
    recipes,
    recipe,
    isLoading,
    error,
    fetchRecipes,
    fetchRecipe,
    clearRecipe,
  };

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipesContext() {
  const context = useContext(RecipesContext);
  
  if (context === undefined) {
    throw new Error('useRecipesContext must be used within a RecipesProvider');
  }
  
  return context;
}