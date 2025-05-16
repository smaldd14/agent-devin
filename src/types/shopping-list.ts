// Shared types for generated shopping list items
/**
 * Represents a single item in a generated shopping list.
 */
export interface ShoppingListItem {
  /** Name of the item */
  itemName: string;
  /** Quantity required */
  quantity: number;
  /** Unit of measurement */
  unit: string;
  /** (Optional) Brand preference */
  brand: string;
}

/**
 * Response payload for generate-shopping-list API
 */
export interface GenerateShoppingListResponse {
  items: ShoppingListItem[];
}