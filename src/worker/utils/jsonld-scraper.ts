import type { RecipeDraft } from '@/types/api';

/**
 * Attempt to extract a RecipeDraft from JSON-LD in the page HTML.
 * Returns null if no valid Recipe JSON-LD is found.
 */
export async function extractRecipeFromJsonLd(url: string): Promise<RecipeDraft | null> {
  const resp = await fetch(url, { redirect: 'follow' });
  const html = await resp.text();
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    try {
      const data = JSON.parse(match[1]);
      const candidates = Array.isArray(data)
        ? data
        : data['@graph']
        ? data['@graph']
        : [data];
      for (const node of candidates) {
        if (node['@type'] === 'Recipe') {
          return mapJsonLdToRecipeDraft(node);
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Map a JSON-LD Recipe node to our RecipeDraft type.
 */
function mapJsonLdToRecipeDraft(node: any): RecipeDraft {
  const title = node.name || '';
  const images: string[] = [];
  if (node.image) {
    if (typeof node.image === 'string') {
      images.push(node.image);
    } else if (Array.isArray(node.image)) {
      for (const img of node.image) {
        if (typeof img === 'string') images.push(img);
        else if (img.url) images.push(img.url);
      }
    } else if (node.image.url) {
      images.push(node.image.url);
    }
  }
  const ingredients = Array.isArray(node.recipeIngredient)
    ? node.recipeIngredient.map((ing: string) => ({ ingredient_name: ing }))
    : [];
  let instructions: string[] = [];
  if (Array.isArray(node.recipeInstructions)) {
    instructions = node.recipeInstructions
      .map((inst: any) => {
        if (typeof inst === 'string') return inst;
        if (typeof inst.text === 'string') return inst.text;
        if (typeof inst.name === 'string') return inst.name;
        return '';
      })
      .filter(Boolean);
  } else if (typeof node.recipeInstructions === 'string') {
    instructions = [node.recipeInstructions];
  }
  const prep_time = node.prepTime || '';
  const cook_time = node.cookTime || '';
  const total_time = node.totalTime || '';
  const serving_size = node.recipeYield || '';
  const nutrition: Record<string, string> = {};
  if (node.nutrition && typeof node.nutrition === 'object') {
    // Cast nutrition object entries to any for type safety
    for (const [key, rawVal] of Object.entries(node.nutrition as Record<string, any>)) {
      const value: any = rawVal;
      if (typeof value === 'string') {
        nutrition[key] = value;
      } else if (value.value != null && value.unitText != null) {
        nutrition[key] = `${value.value} ${value.unitText}`;
      }
    }
  }
  return {
    title,
    images,
    ingredients,
    instructions,
    prep_time,
    cook_time,
    total_time,
    serving_size,
    nutrition,
  };
}