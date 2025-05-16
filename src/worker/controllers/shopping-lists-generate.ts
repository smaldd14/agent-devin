import { Context as HonoContext } from 'hono';
import type { AppType } from '../index';
import { z } from 'zod';
import { parseEnv } from '../config';
import { RecipeRepository } from '../repositories/RecipeRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { LLMService } from '../services/LLMService';
import { ShoppingListService } from '../services/ShoppingListService';
import { GenerateShoppingListRequestSchema } from '../schemas/ShoppingListSchema';
import { success, error } from '../utils/response';
import { ShoppingListItem } from '@/types/shopping-list';
import {
  NotFoundError,
  ValidationError,
  LLMError,
} from '../errors/CustomErrors';

// Define context type with env bindings
type Context = HonoContext<AppType>;

/**
 * Controller for generating a shopping list from a recipe via LLM.
 */
/**
 * Handler for generating a shopping list from a recipe via LLM.
 */
export async function generateShoppingList(c: Context): Promise<Response> {
  try {
    const { recipeId } = (c.req as any).valid('json') as z.infer<
      typeof GenerateShoppingListRequestSchema
    >;
    // Validate environment
    const { OPENAI_API_KEY } = parseEnv(c.env as any);
    // Initialize repositories and services
    const recipeRepo = new RecipeRepository(c.env.DB);
    const inventoryRepo = new InventoryRepository(c.env.DB);
    // const shoppingListRepo = new ShoppingListRepository(c.env.DB);
    const llmService = new LLMService(OPENAI_API_KEY);
    const shoppingListService = new ShoppingListService(
      recipeRepo,
      inventoryRepo,
      llmService
    );
    // Generate shopping list
    const { items } = await shoppingListService.generate(
      recipeId
    );
    // Respond with generated items (shared ShoppingListItem type)
    return success(c, { items: items as ShoppingListItem[] }, 200);
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return error(c, err.message, 400);
    }
    if (err instanceof NotFoundError) {
      return error(c, err.message, 404);
    }
    if (err instanceof LLMError) {
      return error(c, err.message, 502);
    }
    console.error('Unexpected error in generateShoppingList:', err);
    return error(c, 'Internal server error', 500);
  }
}