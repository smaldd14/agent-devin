import { fetchApi } from './api';
import type { ApiResponse, SwipeRecipeCard } from '@/types/api';

/**
 * Lightweight recipe card data used in the swipe interface
 */
export interface RecipeCard {
  recipeId: string;
  name: string;
  image: string;
  cookTime: string;
  difficulty: string;
  externalUrl: string;
}

/**
 * Fetch the next recipe card for swiping, with optional filters
 */
/**
 * Fetch the next recipe card for swiping, with optional filters.
 * Returns a simplified RecipeCard for the UI.
 */
/**
 * Fetch the next recipe card for swiping, using an existing sessionId.
 * Returns a simplified RecipeCard for the UI, plus remaining count.
 */
export async function getNextRecipe(
  sessionId: string
): Promise<ApiResponse<SwipeRecipeCard> & { remaining?: number }> {
  // Call backend to get full SwipeRecipeCard and remaining count
  const res = await fetchApi<{ card: SwipeRecipeCard; remaining: number }>(
    '/swipe/next',
    { params: { sessionId } }
  );
  if (!res.success) {
    return res as any;
  }
  const { card, remaining } = res.data!;
  console.log('Fetched next recipe card:', card);
  console.log('res.data: ', res.data);

  return { success: true, data: card, remaining };
}

/**
 * Record a swipe action (like or skip) for a recipe
 */
/**
 * Record a swipe action (like or skip) for a given session
 */
export async function postSwipeAction(
  sessionId: string,
  recipeId: string,
  action: 'like' | 'skip'
): Promise<ApiResponse<{ recipeId: string; action: string }>> {
  return await fetchApi<{ recipeId: string; action: string }>(
    '/swipe/action',
    {
      method: 'POST',
      body: JSON.stringify({ sessionId, recipeId, action }),
    }
  );
}
/**
 * Undo the last swipe action for a given session.
 * Returns the undone card and updated remaining count.
 */
export async function undoSwipe(
  sessionId: string
): Promise<ApiResponse<{ card: SwipeRecipeCard; remaining: number }>> {
  return await fetchApi<{ card: SwipeRecipeCard; remaining: number }>(
    '/swipe/undo',
    {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }
  );
}
/**
 * Initialize a new swipe session with user-selected filters.
 * Returns sessionId and initial remaining count.
 */
export interface InitSwipeSessionData {
  sessionId: string;
  remaining: number;
}
export async function initSwipeSession(
  filters: { dietary?: string[]; cuisine?: string[]; sites?: string[]; batchSize?: number }
): Promise<ApiResponse<InitSwipeSessionData>> {
  return await fetchApi<InitSwipeSessionData>('/swipe/session', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}