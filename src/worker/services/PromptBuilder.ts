import ShoppingListPrompt from '../prompts/shopping-list-generator.txt';
/**
 * Builds a prompt string for the LLM given recipe and inventory data.
 */
export class PromptBuilder {
  /**
   * Construct a JSON-based prompt for missing item computation.
   */
  static build(
    recipe: { id: number; name: string; ingredients: { ingredient_name: string; quantity: number; unit: string }[] },
    inventory: { item_name: string; quantity: number; unit: string }[]
  ): string {
    // Prepare recipe ingredients list
    const recipeList = recipe.ingredients
      .map((ing) =>
        `{"ingredient_name": "${ing.ingredient_name}", "quantity": ${ing.quantity}, "unit": "${ing.unit}"}`
      )
      .join(', ');
    // Prepare inventory list
    const inventoryList = inventory
      .map((item) =>
        `{"item_name": "${item.item_name}", "quantity": ${item.quantity}, "unit": "${item.unit}"}`
      )
      .join(', ');

    const prompt = ShoppingListPrompt
      .replace('{recipe.id}', recipe.id.toString())
      .replace('{recipe.name}', recipe.name)
      .replace('{recipeList}', recipeList)
      .replace('{inventoryList}', inventoryList);

    return prompt;
  }
}