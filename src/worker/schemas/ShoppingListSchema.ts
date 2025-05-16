import { z } from 'zod';

/**
 * Schema for a single missing item returned by the LLM.
 */
export const MissingItemSchema = z.object({
  itemName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  brand: z.string(),
});

/**
 * Schema for the array of missing items.
 */
export const MissingItemsArraySchema = z.object({
  missingItems: z.array(MissingItemSchema)
});

/**
 * Type for a missing item parsed from the LLM response.
 */
export type MissingItem = z.infer<typeof MissingItemSchema>;

/**
 * Request schema for generating a shopping list.
 */
export const GenerateShoppingListRequestSchema = z.object({
  recipeId: z.number(),
});
