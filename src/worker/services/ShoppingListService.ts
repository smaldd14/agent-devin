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
   * Generate a shopping list for a given recipe ID.
   * @returns the shoppingListId and missing items
   */
  async generate(
    recipeId: number
  ): Promise<{ items: MissingItem[] }> {
    // Fetch recipe details
    const recipe = await this.recipeRepo.getRecipeWithIngredients(recipeId);
    if (!recipe) {
      throw new NotFoundError(`Recipe ${recipeId} not found`);
    }
    // Fetch inventory
    const inventory = await this.inventoryRepo.getAllInventoryItems();
    // Build prompt
    const prompt = PromptBuilder.build(recipe, inventory);
    console.log('Prompt:', prompt);
    // Compute missing items via LLM
    const missingItemsObj = await this.llmService.computeMissingItems(prompt);
    // Persist shopping list
    // const shoppingListId = await this.shoppingListRepo.createShoppingList('llm-delta');
    // Persist items
    // await this.shoppingListRepo.addItems(shoppingListId, missingItemsObj.missingItems);
    return { items: missingItemsObj.missingItems };
  }
}