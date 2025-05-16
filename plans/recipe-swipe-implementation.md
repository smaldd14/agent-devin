# Recipe Swipe Feature Implementation Plan

## Overview
This plan details the technical implementation steps for the Recipe Swipe feature—an interactive, swipe-based recipe discovery UI that integrates external recipe data, leverages existing scraping functionality, and uses ShadcnUI for consistent styling.

## Current Status
The following pieces are implemented and wired together:
  - POST `/api/swipe/session` endpoint: accepts `dietary` + `cuisine` filters, enqueues URL batch via Brave Search API, returns `sessionId` + `remaining` count.
  - Front-end filter form (`FilterControls.tsx`): submits filters, captures `sessionId`.
  - Service layer (`services/swipe.ts`): `initSwipeSession` returns typed data; `getNextRecipe(sessionId)` calls `/swipe/next`.
  - Hook (`useSwipeSession`): manages session lifecycle, prefetches current + next cards.
  - Page component (`SwipePage.tsx`): holds `sessionId`, renders filter form or swipe UI.
  - Backend mapping updated to pull from `data.web.results` in Brave API response.
  
Issues encountered:
  - Calls to GET `/api/swipe/next` are returning unexpected payload or errors; need to debug backend mapping and request parameters.
  - Scraping pipeline (JSON-LD → Browser Rendering → Puppeteer) is in place but not fully exercised yet.

## 1. Architecture

### 1.1 Backend (Hono Worker)
**API Endpoints** under `/api/swipe`:
  - `POST /api/swipe/session` — start a new swipe session: accept filter criteria (dietary, cuisine), call external search API, enqueue a batch of recipe URLs in per-user session storage.
  - `GET /api/swipe/next` — pop and return the next recipe card draft from the user’s session queue.
  - `POST /api/swipe/action` — record a swipe action (`like` or `skip`) for analytics and personalization.
**External Data, Session Init & Scraping**:
  - During session init (`/api/swipe/session`), use an external recipe search API (e.g., Brave Search) with filters to retrieve candidate recipe URLs and enqueue them.
  - For each `GET /api/swipe/next`, de-queue one URL and run a multi-tier scraping pipeline:
    1. **JSON-LD Extraction**: fetch raw HTML, use `DOMParser` or `HTMLRewriter` to find `<script type="application/ld+json">` Recipe Schema blocks and map to `RecipeDraft`.
    2. **Browser-Rendering REST API Fallback**: if JSON-LD is missing or incomplete, call Cloudflare’s Browser-Rendering REST endpoint to get rendered HTML, then re-parse for structured data.
    3. **Durable Object–backed Puppeteer**: for JavaScript-heavy sites, pre-scrape URLs in a per-user Durable Object (launched outside HTTP handlers, reusing a single Puppeteer session) and persist results to KV.

### 1.2 Data Layer
- **Cloudflare KV** (namespace `RECIPE_SWIPE_CACHE`):
  - Cache external API responses and parsed recipe metadata (TTL: 6h, configurable).
  - Store per-session shuffled queues for quick retrieval.
- **D1 (SQLite)** tables:
  - `swipe_history` (`id`, `user_id`, `recipe_id`, `action`, `timestamp`)
  - `liked_recipes` or filtered view of `swipe_history` for retrieving saved recipes.

### 1.3 Caching & Preloading
- On `GET /api/swipe/next`, first check Cloudflare KV for a cached draft; if missing, invoke the Tier 1→2→3 scraping pipeline (JSON-LD → REST API → Durable Object Puppeteer), then store the result in KV with a TTL (e.g. 6 hours).
- Maintain a per-session queue in memory (backed by persistent KV/D1) to support consistent ordering and an “undo” stack.
- Proxy all recipe images through Cloudflare Images or R2 + Image Resizing to deliver optimized thumbnails (webp, width- and quality-constrained).
- Ensure HTTP cache-control headers are set for edge and client caching on static recipe card payloads.

## 2. Frontend (React + TypeScript)

### 2.1 API Service
- **File:** `src/react-app/services/swipe.ts`
  - `getNextRecipe(filters): Promise<RecipeCard>`
  - `postSwipeAction(recipeId, action): Promise<void>`

### 2.2 Hooks & State
- **Hook:** `useSwipeSession.ts`
  - Manages current card state, preloads next card data and image, handles undo stack, and applies filters.

### 2.3 UI Components (ShadcnUI)
- **SwipeCard.tsx**
  - Use ShadcnUI `Card`, `Image`, `Badge`, `Skeleton` for layout.
  - Display `image`, `name`, `cookTime`, `difficulty`.
  - Wrap click area (and right-swipe action) to open external URL in new tab.
- **SwipeDeck.tsx**
  - Integrate `react-tinder-card` (or `react-swipeable`) for gesture handling.
  - Render one `SwipeCard` at a time, animate swipe left/right.
  - Show “Undo” button and progress indicator using ShadcnUI `Button` and `Progress`.
**FilterControls.tsx**
  - Use ShadcnUI `Checkbox`, `Select`, and `Button` to choose dietary filters (e.g., vegetarian, gluten-free, cuisine types).
  - On submit, call `POST /api/swipe/session` with selected filters, then redirect the user to `/swipe` to begin swiping.

### 2.4 Pages & Routing
- Add route `/swipe` in React Router config.
**Page Component:** `src/react-app/pages/Swipe/index.tsx`
  - If no session started yet, render `FilterControls` to collect filters.
  - After session init, render `SwipeDeck` (using `useSwipeSession` hook) for swiping.

## 3. UX & Design
- Responsive design for mobile and desktop via TailwindCSS (wrapped by ShadcnUI).
- Clear like/dislike feedback with animated overlays.
- Keyboard and screen-reader accessibility.

## 4. Milestones & Timeline

| Phase                     | Duration | Deliverables                                       |
|---------------------------|----------|----------------------------------------------------|
| Design & API Contract     | 1 week   | Mockups, JSON schema, review of `recipe-scrape.ts` |
| Backend Integration       | 2 weeks  | Hono routes, KV bindings, D1 schema, scraping hook |
| Frontend Swipe UI         | 2 weeks  | ShadcnUI-based `SwipeCard`, `SwipeDeck`, gestures   |
| Session & Storage Logic   | 1 week   | `useSwipeSession`, caching & undo functionality     |
| Personalization Engine    | 1 week   | Basic preference weighting based on history         |
| Testing & QA              | 1 week   | Unit/integration tests, UX validation              |
| Launch & Monitoring       | 1 week   | Deployment, analytics, Wrangler tail logs          |

## 5. Dependencies
- External recipe search API credentials and rate limits
- Cloudflare KV and D1 bindings in `wrangler.json`
- `react-tinder-card` (or similar) for swipe gestures
- ShadcnUI components (already installed)

## 6. Risks & Mitigations
- **API rate limits:** implement backoff, cache aggressively
- **Parsing edge cases:** fallback to external link only
- **Inconsistent UX across browsers:** test on major browsers and devices

## 7. Next Steps
1. Debug GET `/api/swipe/next`:
   - Verify backend mapping logic pulls from `data.web.results` and returns `{ card, remaining }`.
   - Add unit/integration tests or log sample payloads to isolate errors.
2. Flesh out the scraping pipeline end-to-end:
   - Ensure JSON-LD extractor returns valid `RecipeDraft` for known pages.
   - Test Browser Rendering fallback in Miniflare.
3. Consider simplifying by using Brave Search API’s response fields directly (e.g., `hit.recipe`) to bypass scraping layers when possible.
4. Build the SwipeDeck UI component:
   - Integrate `react-tinder-card` for gesture swipes.
   - Animate left/right swipes, call `swipe('like')` / `swipe('skip')`.
   - Display remaining count and an undo button.
5. Implement persistence for swipe actions:
   - Create `swipe_history` table in D1 or store actions in KV.
   - Wire up `POST /api/swipe/action` to D1.
6. Polish UI/UX:
   - Add progress indicator, loading skeletons, and error states.
   - Ensure mobile responsiveness and accessibility.