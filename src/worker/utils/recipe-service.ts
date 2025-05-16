import { CreateRecipeRequest } from "../controllers/recipes";


/**
 * Inserts a new recipe and its ingredients into the database.
 * @param db - D1 database binding
 * @param data - recipe data to insert
 * @returns the auto-generated recipe ID
 */
export async function insertRecipeAndIngredients(db: any, data: CreateRecipeRequest): Promise<number> {
  // Insert recipe row
  const recipeStmt = db
    .prepare(
      'INSERT INTO recipes (name, instructions, cooking_time, difficulty, url) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      data.name,
      data.instructions,
      data.cooking_time ?? null,
      data.difficulty ?? null,
      data.url ?? null,
    );
  const [recipeResult] = await db.batch([recipeStmt]);
  const recipeId = recipeResult.meta.last_row_id;

  // Insert ingredients if any
  if (data.ingredients && data.ingredients.length > 0) {
    const ingredientStmts = data.ingredients.map((ingredient) =>
      db
        .prepare(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_protein) VALUES (?, ?, ?, ?, ?)',
        )
        .bind(
          recipeId,
          ingredient.ingredient_name,
          ingredient.quantity,
          ingredient.unit,
          ingredient.is_protein ? 1 : 0,
        ),
    );
    await db.batch(ingredientStmts);
  }

  return recipeId;
}