import ShoppingListPrompt from '../prompts/shopping-list-generator.txt';
/**
 * Builds a prompt string for the LLM given recipe and inventory data.
 */
export class PromptBuilder {
  /**
   * Build a combined prompt for multiple recipes and the current inventory.
   * Expects the prompt template to have {ingredients} and {inventoryList} placeholders.
   */
  static build(
    recipes: Array<{ id: number; name: string; ingredients: { ingredient_name: string; quantity: number; unit: string }[] }>,
    inventory: { item_name: string; quantity: number; unit: string }[]
  ): string {
    // Flatten all recipe ingredients, tagging with recipeId
    const allIngredients = recipes.flatMap((r) =>
      r.ingredients.map((ing) => ({
        recipeId: r.id,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
      }))
    );
    // JSON-stringify arrays for insertion into template
    const ingredientsJson = JSON.stringify(allIngredients);
    const inventoryJson = JSON.stringify(
      inventory.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
      }))
    );

    // Replace placeholders in the prompt template
    return ShoppingListPrompt
      .replace('{ingredients}', ingredientsJson)
      .replace('{inventoryList}', inventoryJson);
  }
}