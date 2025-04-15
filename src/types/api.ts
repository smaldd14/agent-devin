// src/types/api.ts

// Shared response type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  // Recipe types
  export interface Recipe {
    id: number;
    name: string;
    instructions: string;
    cooking_time?: number;
    difficulty?: string;
    created_at: string;
    updated_at?: string;
  }
  
  export interface RecipeIngredient {
    id: number;
    recipe_id: number;
    ingredient_name: string;
    quantity: number;
    unit: string;
    is_protein: boolean;
    created_at: string;
  }
  
  export interface CreateRecipeRequest {
    name: string;
    instructions: string;
    cooking_time?: number;
    difficulty?: string;
    ingredients: Array<{
      ingredient_name: string;
      quantity: number;
      unit: string;
      is_protein: boolean;
    }>;
  }
  
  // Inventory types
  export interface InventoryItem {
    id: number;
    item_name: string;
    category: string;
    subcategory?: string;
    item_description?: string;
    brand?: string;
    storage_location: string;
    quantity: number;
    unit: string;
    minimum_quantity?: number;
    expiry_date?: string;
    purchase_date: string;
    unit_price?: number;
    notes?: string;
    restock_flag: boolean;
    created_at: string;
    updated_at?: string;
  }
  
  // Shopping list types
  export interface ShoppingList {
    id: number;
    amazon_link?: string;
    created_at: string;
    updated_at?: string;
    items?: ShoppingListItem[];
  }
  
  export interface ShoppingListItem {
    id: number;
    shopping_list_id: number;
    item_name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    created_at: string;
  }
  
  // Response types
  export type RecipeResponse = ApiResponse<Recipe>;
  export type RecipesResponse = ApiResponse<Recipe[]>;
  export type InventoryItemResponse = ApiResponse<InventoryItem>;
  export type InventoryItemsResponse = ApiResponse<InventoryItem[]>;
  export type ShoppingListResponse = ApiResponse<ShoppingList>;
  export type ShoppingListsResponse = ApiResponse<ShoppingList[]>;