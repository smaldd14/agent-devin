// src/react-app/services/recipes.ts
import { 
  Recipe, 
  RecipeResponse, 
  RecipesResponse, 
  CreateRecipeRequest 
} from '@/types/api';
import { fetchApi } from './api';

const RECIPES_ENDPOINT = '/recipes';

/**
 * Fetch all recipes
 */
export async function getRecipes(): Promise<RecipesResponse> {
  return fetchApi<Recipe[]>(RECIPES_ENDPOINT);
}

/**
 * Fetch a recipe by ID
 */
export async function getRecipeById(id: number): Promise<RecipeResponse> {
  return fetchApi<Recipe>(`${RECIPES_ENDPOINT}/${id}`);
}

/**
 * Create a new recipe
 */
export async function createRecipe(recipe: CreateRecipeRequest): Promise<RecipeResponse> {
  return fetchApi<Recipe>(RECIPES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
}