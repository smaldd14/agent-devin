// src/react-app/services/recipes.ts
import {
  ApiResponse,
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
/**
 * Payload for AI-powered recipe generation
 */
export interface GenerateRecipesRequest {
  max_recipes: number;
  preferences: {
    cuisine?: string;
    dietary?: string;
  };
}

/**
 * Single generated recipe structure
 */
export interface GeneratedRecipe {
  name: string;
  ingredients: {
    ingredient_name: string;
    quantity: number;
    unit: string;
    is_protein: boolean;
  }[];
  instructions: string;
  cooking_time: number;
  difficulty: string;
}

/**
 * AI generation response: recipes + missing shopping list
 */
export interface GenerateRecipesResponse {
  recipes: GeneratedRecipe[];
  shopping_list: string[];
}

/**
 * Invoke AI recipe generation endpoint
 */
export async function generateRecipes(
  params: GenerateRecipesRequest
): Promise<ApiResponse<GenerateRecipesResponse>> {
  return fetchApi<GenerateRecipesResponse>(`${RECIPES_ENDPOINT}/generate`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Scrape a recipe draft from a URL and format as CreateRecipeRequest
 */
export async function scrapeRecipe(
  url: string
): Promise<ApiResponse<CreateRecipeRequest>> {
  return fetchApi<CreateRecipeRequest>(`${RECIPES_ENDPOINT}/scrape`, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}