import { Context as HonoContext } from 'hono';
import { z } from 'zod';
import { success, error } from '../utils/response';
import { Recipe, RecipeIngredient } from '@/types/api';
import { insertRecipeAndIngredients } from '../utils/recipe-service';
import { AppType } from '../index';
// Define typed context
type Context = HonoContext<AppType>;

// Define raw data types for SQLite results
type RawRecipe = Omit<Recipe, 'ingredients'>

interface RawRecipeIngredient extends Omit<RecipeIngredient, 'is_protein'> {
  is_protein: number;
}

// Validation schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  cooking_time: z.number().optional(),
  difficulty: z.string().optional(),
  ingredients: z.array(z.object({
    ingredient_name: z.string().min(1, 'Ingredient name is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(0.001, 'Unit is required'),
    is_protein: z.boolean().default(false)
  })).min(1, 'At least one ingredient is required'),
  url: z.string().url().optional(),
});

export type CreateRecipeRequest = z.infer<typeof createRecipeSchema>;

// Controllers
export async function getAllRecipes(c: Context): Promise<Response> {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM recipes ORDER BY created_at DESC'
      ).all();
      
      // Use type assertion here
      const typedResults = results as RawRecipe[];
      
      return success(c, typedResults);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      return error(c, 'Failed to fetch recipes');
    }
}

export async function getRecipeById(c: Context): Promise<Response> {
  try {
    const id = c.req.param('id');
    
    const recipeData = await c.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ?'
    ).bind(id).first() as RawRecipe | null;
    
    if (!recipeData) {
      return error(c, 'Recipe not found', 404);
    }
    
    // Fetch ingredients for this recipe
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ?'
    ).bind(id).all();

    const ingredients = (results as unknown) as RawRecipeIngredient[];
    
    const recipe = {
        ...recipeData,
        ingredients: ingredients.map((ingredient: RawRecipeIngredient) => ({
            ...ingredient,
            is_protein: ingredient.is_protein === 1
        }))
    } as Recipe;
    
    return success(c, recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err);
    return error(c, 'Failed to fetch recipe');
  }
}

export async function createRecipe(c: Context): Promise<Response> {
  try {
    const data = (c.req as any).valid('json') as CreateRecipeRequest;
    // Insert recipe and its ingredients
    const recipeId = await insertRecipeAndIngredients(c.env.DB, data);
    // Fetch the newly created recipe
    const recipe = (await c.env.DB
      .prepare('SELECT * FROM recipes WHERE id = ?')
      .bind(recipeId)
      .first()) as RawRecipe;
    return success(c, recipe, 201);
  } catch (err) {
    console.error('Error creating recipe:', err);
    return error(c, 'Failed to create recipe');
  }
}