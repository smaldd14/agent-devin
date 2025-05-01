import { Context as HonoContext } from 'hono';
import { z } from 'zod';
import { scrapeRecipeWithBrowser } from '../utils/recipe-scraper';
import { callLLM } from '../utils/llm';
import cleanupPrompt from '../prompts/recipe-cleanup-prompt.txt';
import { type CreateRecipeRequest } from './recipes';
import { success, error } from '../utils/response';
import type { AppType } from '../index';

// Typed context for Hono
type Context = HonoContext<AppType>;

// Validation schema for scraping request
export const scrapeRecipeSchema = z.object({
  url: z.string().url(),
});
export type ScrapeRecipeRequest = z.infer<typeof scrapeRecipeSchema>;

/**
 * Controller: Scrape a recipe page and extract structured data
 */
export async function scrapeRecipe(c: Context): Promise<Response> {
  try {
    // Validate request body
    const { url } = (c.req as any).valid('json') as ScrapeRecipeRequest;
    
    // Ensure Browser Rendering binding is available (remote mode)
    if (!c.env.BROWSER) {
      console.error('Browser Rendering binding unavailable.');
      return error(c, 'Browser Rendering service binding not found. Please run `wrangler dev --remote` or deploy to Cloudflare Workers with the binding.');
    }

    // Perform browser rendering scrape to get raw draft
    const rawDraft = await scrapeRecipeWithBrowser(c.env.BROWSER, url);
    // Clean up and format draft via LLM into CreateRecipeRequest
    const prompt = `${cleanupPrompt}\n\n${JSON.stringify(rawDraft)}`;
    // Invoke LLM to get initial cleaned draft
    const cleanedRaw = await callLLM(
      c.env.OPENAI_API_KEY,
      prompt,
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
      }),
      'recipe_cleanup'
    );
    // Ensure is_protein is always a boolean (default to false if undefined)
    const cleaned: CreateRecipeRequest = {
      ...cleanedRaw,
      ingredients: cleanedRaw.ingredients.map((ing) => ({
        ...ing,
        is_protein: ing.is_protein ?? false,
      })),
    };
    // Return cleaned recipe payload
    return success(c, cleaned);
  } catch (err) {
    console.error('Error scraping recipe:', err);
    return error(c, 'Failed to scrape recipe');
  }
}