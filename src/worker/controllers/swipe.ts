import { Context as HonoContext } from 'hono';
import { z } from 'zod';
// Scraping logic is stubbed out for now
// import { scrapeRecipeWithBrowser } from '../utils/recipe-scraper';
// import { extractRecipeFromJsonLd } from '../utils/jsonld-scraper';
import { success, error } from '../utils/response';
import { extractRecipeFromJsonLd } from '../utils/jsonld-scraper';
import type { AppType } from '../index';
import type { BraveHowTo, SwipeRecipeCard } from '@/types/api';
import { insertRecipeAndIngredients } from '../utils/recipe-service';
import { CreateRecipeRequest } from './recipes';

type Context = HonoContext<AppType>;

// Schema for POST /api/swipe/session
export const createSwipeSessionSchema = z.object({
  dietary: z.array(z.string()).optional(),
  cuisine: z.array(z.string()).optional(),
  sites: z.array(z.string()).optional(),
  batchSize: z.number().int().positive().default(20),
});

/**
 * Controller: start a new swipe session by querying Brave Search and enqueueing URLs
 */
export async function postSwipeSession(c: Context): Promise<Response> {
  try {
    const { dietary = [], cuisine = [], sites = [], batchSize } = (c.req as any).valid('json') as z.infer<typeof createSwipeSessionSchema>;
    console.log(`[swipe][session] Received filters: dietary=${dietary}, cuisine=${cuisine}, sites=${sites}, batchSize=${batchSize}`);
    // Build search query from filters
    const terms: string[] = [];
    if (dietary.length) terms.push(...dietary);
    if (cuisine.length) terms.push(...cuisine);
    terms.push('recipe');
    if (sites.length) terms.push(`site:${sites.join(' OR site:')}`);
    const query = terms.join(' ');
    console.log(`[swipe][session] Built search query: "${query}"`);
    // Fetch search results from Brave Search API
    const apiKey = c.env.BRAVE_API_KEY;
    if (!apiKey) {
      return error(c, 'Brave API key missing', 500);
    }
    // Build Brave Search API URL with query, count and filter for web results
    const params = new URLSearchParams({
      q: query,
      count: batchSize.toString(),
      result_filter: 'web',
    });
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?${params.toString()}`;
    console.log(`[swipe][session] Fetching Brave Search URL: ${searchUrl}`);
    const resp = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });
    console.log(`[swipe][session] Brave Search API responded with status ${resp.status}`);
    if (!resp.ok) {
      console.error(`[swipe][session] Brave Search error response: ${resp.status}`);
      return error(c, `Brave Search API error: ${resp.status}`, resp.status);
    }
    const data: any = await resp.json();

    // Extract hits from Brave response (prefer search.results, then web.results)
    const hits: any[] = Array.isArray(data.web?.results) ? data.web.results : [];
    // Helper: map Brave-native Recipe object into SwipeRecipeCard
    function mapBraveRecipeToCard(br: any, pageUrl: string): SwipeRecipeCard {
      return {
        recipeId: pageUrl,
        name: br.title,
        description: br.description,
        image: br.thumbnail?.original || '',
        prepTime: br.prep_time,
        cookTime: br.cook_time,
        totalTime: br.time,
        servingSize: br.servings,
        difficulty: 'changeme',
        // Ensure ingredients is always an array of strings
        ingredients: Array.isArray(br.ingredients) ? br.ingredients : [],
        instructions: br.instructions as BraveHowTo[] || [],
        nutrition: br.calories ? { calories: br.calories } : {}, // brave doesn't provide nutrition
        externalUrl: br.url || pageUrl,
        rating: br.rating,
        category: br.recipeCategory,
        cuisine: br.recipeCuisine,
        domain: br.domain,
        favicon: br.favicon,
      };
    }
    // Build URL queue (deduped) and cache any Brave-native cards
    let urls: string[] = [];
    const urlSet = new Set<string>();
    for (const hit of hits) {
      // only adding brave's native recipe cards
      if (hit.recipe) {
        const pageUrl = hit.url;
        if (!pageUrl || urlSet.has(pageUrl)) continue;
        urlSet.add(pageUrl);
        urls.push(pageUrl);
        try {
          const card = mapBraveRecipeToCard(hit.recipe, pageUrl);
          const cardKey = `card:${pageUrl}`;
          await c.env.RECIPE_SWIPE_CACHE.put(cardKey, JSON.stringify(card), { expirationTtl: 6 * 3600 });
          console.log(`[swipe][session] Cached Brave recipe card for URL: ${pageUrl}`);
        } catch (e) {
          console.error(`[swipe][session] Failed to cache Brave recipe card for URL: ${pageUrl}`, e);
        }
      }
    }
    // Shuffle and limit to batchSize
    console.log(`[swipe][session] Extracted ${urls.length} URLs before shuffle/limit`);
    function shuffle(arr: string[]) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    shuffle(urls);
    urls = urls.slice(0, batchSize as number);
    console.log(`[swipe][session] URLs count after shuffle/limit: ${urls.length}`);
    // Generate sessionId and store in KV
    const sessionId = crypto.randomUUID();
    console.log(`[swipe][session] Generated sessionId: ${sessionId}`);
    const key = `session:${sessionId}:queue`;
    await c.env.RECIPE_SWIPE_CACHE.put(key, JSON.stringify(urls), { expirationTtl: 6 * 3600 });
    console.log(`[swipe][session] Stored session queue in KV under key ${key}`);
    console.log(`[swipe][session] Session setup complete, returning sessionId and remaining count`);
    return success(c, { sessionId, remaining: urls.length });
  } catch (err) {
    console.error('Error starting swipe session:', err);
    return error(c, 'Failed to start swipe session', 500);
  }
}

// Schema for GET /api/swipe/next?sessionId=<sessionId>
export const nextRecipeQuerySchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * Controller: fetch the next recipe card by scraping the given URL
 */
/**
 * Controller: fetch the next recipe card by popping a URL from the user's session queue,
 * then scraping that URL.
 */
export async function getNextRecipe(c: Context): Promise<Response> {
  try {
    // STUB: Return a placeholder card and skip scraping logic for now
    console.log('Fetching next recipe card (stubbed)...');
    const { sessionId } = (c.req as any).valid('query') as z.infer<typeof nextRecipeQuerySchema>;
    const sessionKey = `session:${sessionId}:queue`;
    const queueJson = await c.env.RECIPE_SWIPE_CACHE.get(sessionKey);
    if (!queueJson) {
      return error(c, 'Session not found or expired', 404);
    }
    const urls = JSON.parse(queueJson) as string[];
    if (!Array.isArray(urls) || urls.length === 0) {
      return error(c, 'No more recipes in session', 404);
    }
    const url = urls.shift() as string;
    // Persist updated queue back to KV
    await c.env.RECIPE_SWIPE_CACHE.put(sessionKey, JSON.stringify(urls), { expirationTtl: 6 * 3600 });
    // Tier 0: Serve any pre-cached Brave Search card
    const cardKey = `card:${url}`;
    console.log(`[swipe] Attempting to fetch cached card for URL: ${cardKey}`);
    const cachedCardJson = await c.env.RECIPE_SWIPE_CACHE.get(cardKey);
    if (cachedCardJson) {
      console.log(`[swipe] Found cached card for URL: ${url}`);
      const card = JSON.parse(cachedCardJson) as SwipeRecipeCard;
      return success(c, { card, remaining: urls.length });
    }
    // Tier 1: Attempt JSON-LD extraction
    try {
      const rawDraft = await extractRecipeFromJsonLd(url);
      if (rawDraft) {
        console.log(`[swipe] JSON-LD extraction succeeded for URL: ${url}`);
        const card: SwipeRecipeCard = {
          recipeId: url,
          name: rawDraft.title,
          description: undefined,
          image: rawDraft.images[0] || '',
          prepTime: rawDraft.prep_time,
          cookTime: rawDraft.cook_time,
          totalTime: rawDraft.total_time,
          servingSize: rawDraft.serving_size,
          difficulty: undefined,
          ingredients: rawDraft.ingredients.map((i) => i.ingredient_name),
          instructions: [{ text: rawDraft.instructions.join('\n') }],
          nutrition: rawDraft.nutrition,
          externalUrl: url,
        };
        // Cache generated card
        await c.env.RECIPE_SWIPE_CACHE.put(cardKey, JSON.stringify(card), { expirationTtl: 6 * 3600 });
        return success(c, { card, remaining: urls.length });
      }
    } catch (e) {
      console.error(`[swipe] JSON-LD extraction error for URL: ${url}`, e);
    }
    // Fallback: stubbed card
    const stubCard: SwipeRecipeCard = {
      recipeId: url,
      name: `Recipe: ${url}`,
      description: 'Swipe to like or skip.',
      image: '',
      externalUrl: url,
    };
    return success(c, { card: stubCard, remaining: urls.length });
  } catch (err) {
    console.error('Error fetching next swipe recipe:', err);
    return error(c, 'Failed to fetch next recipe', 500);
  }
}

// Schema for POST /api/swipe/action
// Schema for POST /api/swipe/action
export const swipeActionSchema = z.object({
  sessionId: z.string().uuid(),
  recipeId: z.string(),
  action: z.enum(['like', 'skip']),
});

/**
 * Controller: record a swipe action (like or skip)
 */
/**
 * Controller: record a swipe action (like or skip) in D1 swipe_history
 */
export async function postSwipeAction(c: Context): Promise<Response> {
  try {
    const { sessionId, recipeId, action } = (c.req as any).valid('json') as z.infer<typeof swipeActionSchema>;
    // Persist action to D1
    const stmt = c.env.DB.prepare(
      `INSERT INTO swipe_history (session_id, recipe_id, action) VALUES (?, ?, ?)`
    );
    await stmt.bind(sessionId, recipeId, action).run();
    // If user liked the recipe, add it to recipes table
    if (action === 'like') {
      try {
        const cardKey = `card:${recipeId}`;
        const cardJson = await c.env.RECIPE_SWIPE_CACHE.get(cardKey);
        if (cardJson) {
          const card = JSON.parse(cardJson) as SwipeRecipeCard;
          // Map SwipeRecipeCard to CreateRecipeRequest
          // Normalize ingredients array
          let ingredientNames: string[];
          if (Array.isArray(card.ingredients)) {
            ingredientNames = card.ingredients;
          } else if (typeof card.ingredients === 'string') {
            ingredientNames = [card.ingredients];
          } else {
            ingredientNames = [];
          }
          const createData: CreateRecipeRequest = {
            name: card.name,
            instructions: card.instructions?.map((step) => step.text).join('\n') || '',
            cooking_time: card.cookTime ? parseInt(card.cookTime) : undefined,
            difficulty: card.difficulty,
            ingredients: ingredientNames.map((ing) => ({
              ingredient_name: ing,
              quantity: 1,
              unit: '',
              is_protein: false,
            })),
            url: card.externalUrl,
          };
          await insertRecipeAndIngredients(c.env.DB, createData);
          console.log(`[swipe][action] Added liked recipe "${createData.name}" to recipes table`);
        } else {
          console.warn(`[swipe][action] No cached card found for recipeId: ${recipeId}`);
        }
      } catch (err) {
        console.error('[swipe][action] Error adding liked recipe to DB:', err);
      }
    }
    return success(c, { recipeId, action });
  } catch (err) {
    console.error('Error recording swipe action:', err);
    return error(c, 'Failed to record swipe action', 500);
  }
}

// Schema for POST /api/swipe/undo
export const swipeUndoSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * Controller: undo the last swipe action by session
 */
export async function postSwipeUndo(c: Context): Promise<Response> {
  try {
    const { sessionId } = (c.req as any).valid('json') as z.infer<typeof swipeUndoSchema>;
    // Fetch most recent swipe entry
    const select = c.env.DB.prepare(
      `SELECT id, recipe_id FROM swipe_history WHERE session_id = ? ORDER BY id DESC LIMIT 1`
    );
    const selectRes = await select.bind(sessionId).all();
    const rows = selectRes.results as Array<{ id: number; recipe_id: string }>;
    if (!rows || rows.length === 0) {
      return error(c, 'No swipe actions to undo', 400);
    }
    const { id, recipe_id } = rows[0];
    // Delete the swipe history entry
    await c.env.DB.prepare(`DELETE FROM swipe_history WHERE id = ?`).bind(id).run();
    // Load current session queue for remaining count
    const sessionKey = `session:${sessionId}:queue`;
    const queueJson = await c.env.RECIPE_SWIPE_CACHE.get(sessionKey);
    const urls = queueJson ? (JSON.parse(queueJson) as string[]) : [];
    // Stub: rebuild the card for the undone recipe
    const stubCard: SwipeRecipeCard = {
      recipeId: recipe_id,
      name: `Recipe: ${recipe_id}`,
      description: 'Swipe to like or skip.',
      image: '',
      externalUrl: recipe_id,
    };
    return success(c, { card: stubCard, remaining: urls.length });
  } catch (err) {
    console.error('Error undoing swipe action:', err);
    return error(c, 'Failed to undo swipe action', 500);
  }
}