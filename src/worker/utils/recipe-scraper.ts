import puppeteer, { type Browser } from '@cloudflare/puppeteer';
import type { RecipeDraft } from '@/types/api';

/**
 * Cached Browser instance promise, so we only launch once per Worker.
 */
let browserPromise: Promise<Browser> | null = null;
function getBrowser(binding: any) {
  if (!browserPromise) browserPromise = puppeteer.launch(binding);
  return browserPromise;
}

/**
 * Launch a headless browser page, navigate to the given URL,
 * and extract raw recipe data, reusing the browser instance.
 */
export async function scrapeRecipeWithBrowser(
  binding: any,
  url: string
): Promise<RecipeDraft> {
  const browser = await getBrowser(binding);
  const page = await browser.newPage();
  try {
    // Increase default timeouts for slow pages
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    // Block images, fonts, stylesheets, media to speed up load
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    // Navigate and wait for network to be idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Extract structured data in page context
    const recipeDraft = (await page.evaluate(() => {
    const getMeta = (selector: string, attr: string) => {
      const el = document.querySelector(selector);
      return el?.getAttribute(attr) || '';
    };
    const title = getMeta('meta[property="og:title"]', 'content') || document.title;
    let ingredients = Array.from(
      document.querySelectorAll('[itemprop="recipeIngredient"]')
    ).map(el => ({ ingredient_name: el.textContent?.trim() || '' }));
    if (ingredients.length === 0) {
      const candidateEls = Array.from(document.querySelectorAll('[id],[class]')).filter(el => {
        const id = el.id || '';
        const cls = el.className || '';
        return /ingredient/i.test(id) || /ingredient/i.test(cls);
      });
      ingredients = candidateEls.flatMap(el =>
        Array.from(el.querySelectorAll('li, p')).map(item => ({
          ingredient_name: item.textContent?.trim() || ''
        }))
      ).filter(ing => ing.ingredient_name);
    }
    let instructions = Array.from(
      document.querySelectorAll('[itemprop="recipeInstructions"]')
    ).map(el => el.textContent?.trim() || '').filter(inst => inst);
    if (instructions.length === 0) {
      const candidateEls = Array.from(document.querySelectorAll('[id],[class]')).filter(el => {
        const id = el.id || '';
        const cls = el.className || '';
        return /instruction|direction|method/i.test(id) || /instruction|direction|method/i.test(cls);
      });
      instructions = candidateEls.flatMap(el =>
        Array.from(el.querySelectorAll('li, p')).map(item => item.textContent?.trim() || '')
      ).filter(inst => inst);
    }
    let prep_time = getMeta('meta[itemprop="prepTime"]', 'content');
    let cook_time = getMeta('meta[itemprop="cookTime"]', 'content');
    let total_time = getMeta('meta[itemprop="totalTime"]', 'content');
    if (!prep_time) {
      const el = Array.from(document.querySelectorAll('[id],[class]')).find(e => /prep[-_ ]?time/i.test(e.id || e.className));
      prep_time = el?.textContent?.trim() || '';
    }
    if (!cook_time) {
      const el = Array.from(document.querySelectorAll('[id],[class]')).find(e => /cook[-_ ]?time/i.test(e.id || e.className));
      cook_time = el?.textContent?.trim() || '';
    }
    if (!total_time) {
      const el = Array.from(document.querySelectorAll('[id],[class]')).find(e => /total[-_ ]?time/i.test(e.id || e.className));
      total_time = el?.textContent?.trim() || '';
    }
    let serving_size = getMeta('meta[itemprop="recipeYield"]', 'content');
    if (!serving_size) {
      const el = Array.from(document.querySelectorAll('[id],[class]')).find(e => /serving|yield/i.test(e.id || e.className));
      serving_size = el?.textContent?.trim() || '';
    }
    const nutrition: Record<string, string> = {};
    const nutritionEl = document.querySelector('[itemprop="nutrition"]');
    if (nutritionEl) {
      Array.from(nutritionEl.querySelectorAll('[itemprop]')).forEach(el => {
        const key = el.getAttribute('itemprop');
        if (key) nutrition[key] = el.textContent?.trim() || '';
      });
    }
    if (Object.keys(nutrition).length === 0) {
      const container = Array.from(document.querySelectorAll('[id],[class]')).find(e => /nutrition/i.test(e.id || e.className));
      if (container) {
        Array.from(container.querySelectorAll('li, p, span, div')).forEach(item => {
          const text = item.textContent?.trim() || '';
          const parts = text.split(':').map(s => s.trim());
          if (parts.length === 2 && parts[0] && parts[1]) {
            nutrition[parts[0]] = parts[1];
          }
        });
      }
    }
    ingredients = ingredients.filter((ing, idx, self) =>
      self.findIndex(i => i.ingredient_name === ing.ingredient_name) === idx
    );
    instructions = instructions.filter((inst, idx, self) =>
      self.indexOf(inst) === idx
    );
    const images: string[] = [];
    const ogImage = getMeta('meta[property="og:image"]', 'content');
    if (ogImage) images.push(ogImage);
    document.querySelectorAll('[itemprop="image"]').forEach(el => {
      const src = el.getAttribute('src') || el.getAttribute('content');
      if (src) images.push(src);
    });
    return {
      title,
      ingredients,
      instructions,
      prep_time,
      cook_time,
      total_time,
      serving_size,
      nutrition,
      images,
    };
    })) as RecipeDraft;
    return recipeDraft;
  } finally {
    // Always close the page to free resources; keep browser instance alive for reuse
    await page.close();
  }
}