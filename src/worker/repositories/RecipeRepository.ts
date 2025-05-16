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
}