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
    ingredients?: RecipeIngredient[];
    url?: string;
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
    url?: string;
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
  brand?: string;
  created_at: string;
  }
  
  // AI-generated recipe types
  export interface GeneratedRecipe {
    name: string;
    ingredients: {
      ingredient_name: string;
      quantity: number;
      unit: string;
      is_protein: boolean;
    }[];
    instructions: string;
    cooking_time: number;
    difficulty: string;
  }

  export interface GenerateRecipesResponse {
    recipes: GeneratedRecipe[];
    shopping_list: string[];
  }
  
// Scraped recipe draft returned by /api/recipes/scrape
export interface RecipeDraft {
  title: string;
  ingredients: { ingredient_name: string }[];
  instructions: string[];
  prep_time: string;
  cook_time: string;
  total_time: string;
  serving_size: string;
  nutrition: Record<string, string>;
  images: string[];
}
export type RecipeDraftResponse = ApiResponse<RecipeDraft>;
  
// Response types
  export type RecipeResponse = ApiResponse<Recipe>;
  export type RecipesResponse = ApiResponse<Recipe[]>;
  export type InventoryItemResponse = ApiResponse<InventoryItem>;
  export type InventoryItemsResponse = ApiResponse<InventoryItem[]>;
  export type ShoppingListResponse = ApiResponse<ShoppingList>;
  export type ShoppingListsResponse = ApiResponse<ShoppingList[]>;
// Recipe recommendations returned by /api/recipes/recommendations
/**
 * A lightweight recipe suggestion based on a protein.
 */
export interface RecipeRecommendation {
  protein: string;
  title: string;
  url: string;
  image_url: string;
  description: string;
}
export type RecommendationsResponse = ApiResponse<RecipeRecommendation[]>;

export interface BraveHowTo {
  text: string;
  name?: string;
  url?: string;
  image?: string[];
}

export interface BraveRating {
  ratingValue: number;
  bestRating: number;
  reviewCount?: number;
  profile?: string;
  isTripAdvisor: boolean;
}
// Swipe-based recipe card for the discovery UI
export interface SwipeRecipeCard {
  // Unique identifier, use the recipe URL
  recipeId: string;
  // Display name/title of the recipe
  name: string;
  // Short description or summary
  description?: string;
  // Main image URL for the card
  image: string;
  // Preparation time (e.g., "15 mins")
  prepTime?: string;
  // Cooking time (e.g., "30 mins")
  cookTime?: string;
  // Total time (e.g., "45 mins")
  totalTime?: string;
  // Number of servings (e.g., "4 servings")
  servingSize?: string;
  // Difficulty level (e.g., "easy", "medium", "hard")
  difficulty?: string;
  // List of ingredient names
  ingredients?: string[];
  // List of instruction steps
  instructions?: BraveHowTo[];
  // Nutrition facts map (e.g., { calories: "200 kcal" })
  nutrition?: Record<string, string>;
  // Original source URL to view full recipe
  externalUrl: string;
  // Optional rating info
  rating?: BraveRating;
  // Category/taxonomy of the recipe
  category?: string;
  // Cuisine type (e.g., "Italian")
  cuisine?: string;
  // Source domain (e.g., "allrecipes.com")
  domain?: string;
  // Favicon for source site
  favicon?: string;
}
// Response wrapper for swipe card + remaining count
export type SwipeRecipeCardResponse = ApiResponse<{ card: SwipeRecipeCard; remaining: number }>;