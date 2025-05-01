import { Context as HonoContext } from 'hono';
import { z } from 'zod';
import { callLLM } from '../utils/llm';
import recipeTemplate from '../prompts/recipe-generator.txt';
import { success, error } from '../utils/response';
import type { AppType } from '../index';

// Typed context for Hono
type Context = HonoContext<AppType>;

// Validation schema for recipe generation request
export const generateRecipeSchema = z.object({
  max_recipes: z.number().int().min(1).max(10),
  preferences: z.record(z.any()).default({}),
});
export type GenerateRecipeRequest = z.infer<typeof generateRecipeSchema>;
// Schema for structured recipe generation response
const generateRecipeResponseSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          ingredient_name: z.string(),
          quantity: z.number(),
          unit: z.string(),
          is_protein: z.boolean(),
        })
      ),
      instructions: z.string(),
      cooking_time: z.number(),
      difficulty: z.string(),
    })
  ),
  shopping_list: z.array(z.string()),
});

/**
 * Controller: Generate AI-powered recipes based on inventory and preferences
 */
export async function generateRecipe(c: Context): Promise<Response> {
  try {
    // Validate request body
    const data = (c.req as any).valid('json') as GenerateRecipeRequest;

    // Fetch all inventory items
    const { results } = await c.env.DB.prepare('SELECT * FROM inventory_items').all();
    const rawItems = results as Record<string, any>[];

    // Convert inventory to CSV format
    const header = [
      'item_name', 'category', 'subcategory', 'item_description', 'brand',
      'storage_location', 'quantity', 'unit', 'minimum_quantity', 'expiry_date',
      'purchase_date', 'unit_price', 'notes', 'restock_flag'
    ];
    const lines: string[] = [header.join(',')];
    rawItems.forEach(item => {
      const row = header.map(key => {
        const val = item[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'number') return val.toString();
        // Escape double-quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      lines.push(row.join(','));
    });
    const inventoryCsv = lines.join('\n');

    // Insert inventory and preferences into prompt template
    const preferencesString = JSON.stringify(data.preferences);
    const prompt = recipeTemplate
      .replace('{inventory}', inventoryCsv)
      .replace('{preferences}', preferencesString)
      .replace('{max_recipes}', String(data.max_recipes));

    // Call LLM to get structured recipe response
    const parsed = await callLLM(
      c.env.OPENAI_API_KEY,
      prompt,
      generateRecipeResponseSchema,
      'recipe_response'
    );
    return success(c, parsed);
  } catch (err) {
    console.error('Error generating recipes:', err);
    return error(c, 'Failed to generate recipes');
  }
}