import { RecipeRepository } from '../repositories/RecipeRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { PromptBuilder } from './PromptBuilder';
import { LLMService } from './LLMService';
import type { MissingItem } from '../schemas/ShoppingListSchema';
import { NotFoundError } from '../errors/CustomErrors';

/**
 * Service to orchestrate shopping list generation.
 */
export class ShoppingListService {
  constructor(
    private recipeRepo: RecipeRepository,
    private inventoryRepo: InventoryRepository,
    private llmService: LLMService
  ) {}

  /**
   * Generate a shopping list for one or more recipe IDs via LLM.
   * @param recipeIds array of recipe IDs
   */
  async generate(
    recipeIds: number[]
  ): Promise<{ items: MissingItem[] }> {
    // Fetch details for all recipes
    const recipes = await this.recipeRepo.getRecipesWithIngredients(recipeIds);
    if (recipes.length === 0) {
      throw new NotFoundError(`No recipes found for IDs: ${recipeIds.join(',')}`);
    }
    // Fetch inventory
    const inventory = await this.inventoryRepo.getAllInventoryItems();
    // Build combined prompt for multiple recipes
    const prompt = PromptBuilder.build(recipes, inventory);
    // Compute missing items via LLM
    const missingItemsObj = await this.llmService.computeMissingItems(prompt);
    // Persist shopping list
    // const shoppingListId = await this.shoppingListRepo.createShoppingList('llm-delta');
    // Persist items
    // await this.shoppingListRepo.addItems(shoppingListId, missingItemsObj.missingItems);
    return { items: missingItemsObj.missingItems };
  }
}