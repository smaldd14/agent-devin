import type { D1Database } from '@cloudflare/workers-types/2023-07-01';
import { NotFoundError } from '../errors/CustomErrors';

/**
 * Repository for accessing recipe data.
 */
export class RecipeRepository {
  constructor(private db: D1Database) {}

  /**
   * Fetch recipe name and ingredients for a given recipeId.
   */
  async getRecipeWithIngredients(recipeId: number): Promise<{
    id: number;
    name: string;
    ingredients: Array<{ ingredient_name: string; quantity: number; unit: string }>;
  }> {
    const recipeRow = await this.db
      .prepare('SELECT id, name FROM recipes WHERE id = ?')
      .bind(recipeId)
      .first();
    if (!recipeRow) {
      throw new NotFoundError(`Recipe with id ${recipeId} not found`);
    }
    const ingredientsRes = await this.db
      .prepare(
        'SELECT ingredient_name, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?'
      )
      .bind(recipeId)
      .all();
    const ingredients = (ingredientsRes.results as any[])?.map((row) => ({
      ingredient_name: row.ingredient_name,
      quantity: row.quantity,
      unit: row.unit,
    }));
    return { id: recipeRow.id as number, name: recipeRow.name as string, ingredients };
  }

    /**
   * Fetch multiple recipes with ingredients by their IDs.
   * @param recipeIds array of recipe IDs
   */
    async getRecipesWithIngredients(
      recipeIds: number[]
    ): Promise<Array<{ id: number; name: string; ingredients: Array<{ ingredient_name: string; quantity: number; unit: string }> }>> {
      if (recipeIds.length === 0) return [];
      // Fetch recipes
      const placeholders = recipeIds.map(() => '?').join(',');
      const recipeRows = await this.db
        .prepare(`SELECT id, name FROM recipes WHERE id IN (${placeholders})`)
        .bind(...recipeIds)
        .all();
    // Initialize recipes array with typed structure
    const recipes = (recipeRows.results as any[]).map(r => ({
      id: r.id as number,
      name: r.name as string,
      ingredients: [] as Array<{ ingredient_name: string; quantity: number; unit: string }>,
    }));
      if (recipes.length === 0) return [];
      // Fetch ingredients for all recipes
      const ingredientRows = await this.db
        .prepare(`SELECT recipe_id, ingredient_name, quantity, unit FROM recipe_ingredients WHERE recipe_id IN (${placeholders})`)
        .bind(...recipeIds)
        .all();
      (ingredientRows.results as any[]).forEach(row => {
        const rec = recipes.find(r => r.id === row.recipe_id);
        if (rec) {
          rec.ingredients.push({
            ingredient_name: row.ingredient_name,
            quantity: row.quantity,
            unit: row.unit,
          });
        }
      });
      return recipes;
    }
}
