import { Context as HonoContext } from 'hono';
import { z } from 'zod';
import { success, error } from '../utils/response';
import { Recipe, RecipeIngredient } from '@/types/api';
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
    unit: z.string().min(1, 'Unit is required'),
    is_protein: z.boolean().default(false)
  })).min(1, 'At least one ingredient is required')
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
    const data = c.get('json') as CreateRecipeRequest;
    
    // Start a transaction for creating recipe and ingredients
    const recipeStmt = c.env.DB.prepare(
      'INSERT INTO recipes (name, instructions, cooking_time, difficulty) VALUES (?, ?, ?, ?)'
    ).bind(data.name, data.instructions, data.cooking_time || null, data.difficulty || null);
    
    const result = await c.env.DB.batch([recipeStmt]);
    const recipeId = result[0].meta.last_row_id;
    
    // Insert ingredients
    const ingredientStmts = data.ingredients.map((ingredient) => {
      return c.env.DB.prepare(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_protein) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        recipeId, 
        ingredient.ingredient_name, 
        ingredient.quantity, 
        ingredient.unit, 
        ingredient.is_protein ? 1 : 0
      );
    });
    
    await c.env.DB.batch(ingredientStmts);
    
    // Fetch the newly created recipe
    const recipe = await c.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ?'
    ).bind(recipeId).first() as RawRecipe;
    
    return success(c, recipe, 201);
  } catch (err) {
    console.error('Error creating recipe:', err);
    return error(c, 'Failed to create recipe');
  }
}