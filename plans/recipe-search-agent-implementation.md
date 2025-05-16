 # Plan: Recipe Search Agent Implementation

 This document outlines the phases, milestones, tasks, timeline estimates, dependencies, and risks for implementing the Recipe Search Agent feature as defined in `docs/prd/recipe-search-agent-prd.md`.

 ## 1. Overview
 - **Goal:** Automatically discover and return recipe suggestions based on proteins in inventory, with caching and API/UI integrations.
 - **Primary Components:**
   1. Cloudflare Agents SDK class (`RecipeSearchAgent`)
   2. Workers KV namespace for caching (`RECIPE_CACHE_KV`)
   3. Search API integration (e.g., Bing/Spoonacular)
   4. Hono API endpoint `/api/recipes/recommendations`
   5. React UI component for displaying recommendations

 ## 2. Phases & Milestones
 | Phase                                | Duration  | Deliverables                                      |
 |--------------------------------------|-----------|---------------------------------------------------|
 | 1. Design & Setup                    | 1 week    | KV binding, env vars, TS types, Agent scaffold    |
 | 2. Agent Logic & Search Integration  | 2 weeks   | Agent `getRecommendations` + search wrapper tests |
 | 3. KV Caching Implementation         | 1 week    | Cache helper, integration tests                   |
 | 4. API & UI Integration              | 2 weeks   | Hono controller + React component + tests         |
 | 5. Testing, QA & Deployment          | 1 week    | E2E tests, performance tuning, deployment scripts |

 Total estimate: **7 weeks**

 ## 3. Detailed Tasks

 ### Phase 1: Design & Setup
 - Review PRD and confirm scope
 - Create KV namespace `RECIPE_CACHE_KV` in `wrangler.toml`
 - Add required secrets/env vars for Search API key
 - Define TypeScript types: `RecipeRecommendation`, `RecommendationsResponse`
 - Add Agents SDK dependency and initial Agent class stub under `src/worker/agents/RecipeSearchAgent.ts`
 - Register Agent-related bindings (KV, AI Gateway) in `wrangler.toml`

 ### Phase 2: Agent Logic & Search Integration
 - Implement Agent method `async getRecommendations(proteins: string[]): Promise<RecipeRecommendation[]>`:
   - Query D1 for proteins: `SELECT item_name FROM inventory_items WHERE is_protein=1 AND quantity>0`
   - Loop proteins: for each, invoke `getCachedOrFetch(protein)`
 - Build search wrapper `src/worker/utils/recipe-searcher.ts`:
   - HTTP client for chosen Search API
   - Parse top-N results (title, url, image, description)
   - Write unit tests mocking API responses

 ### Phase 3: KV Caching Implementation
 - In Agent: add helper `getCachedOrFetch(protein)`:
   - Try `KV.get('protein:' + protein)`
   - If hit, return parsed array
   - Else, call searcher, then `KV.put(key, JSON, { expirationTtl })`
 - Write integration tests for caching behavior

 ### Phase 4: API & UI Integration
 **Backend**
 - Create Hono controller `src/worker/controllers/recipes-recommendations.ts`:
   - Validate query param `proteins` (optional)
   - Instantiate Agent client or call internal Agent method
   - Return `RecommendationsResponse`
 - Register route in `src/worker/routes/recipes.ts`:
   ```ts
   routes.get('/recommendations', recommendationsHandler);
   ```
 - Write unit tests for controller (mock Agent client)

 **Frontend**
 - Add service method `getRecommendations(proteins?: string[]): Promise<RecipeRecommendation[]>` in `src/react-app/services/recipes.ts`
 - Create React component `RecommendationsList.tsx`:
   - Call service on mount / button click
   - Display grid of cards (image, title, link, description)
   - Handle loading, errors, and empty states
 - Add page/view (e.g., `/recipes/recommendations`) and link in nav
 - Write React Testing Library tests for component

 ### Phase 5: Testing, QA & Deployment
 - End-to-end tests (Miniflare + Vite) covering full flow
 - Load/performance testing: cache vs cold-fetch latencies
 - Security audit: sanitize external data, validate inputs
 - Documentation updates: `docs/`, `codex.md`
 - Deployment:
   - Verify KV and Agent bindings in `wrangler.toml`
   - Run `npm run build`, `wrangler publish`
   - Monitor via `wrangler tail` and metrics dashboard

 ## 4. Dependencies & Risks
 ### Dependencies
 - Cloudflare Workers KV
 - Search API provider (Bing, Spoonacular, etc.)
 - Agents SDK and Durable Objects (if used)
 ### Risks & Mitigations
 - **Search API rate limits/costs**: implement backoff and caching
 - **KV consistency delays**: TTL tuning, consider Durable Objects cache
 - **Inventory data accuracy**: validate against schema, fallback UI editing
 - **Agent cold-start latency**: keep Agent warm or use direct Worker route fallback

 *End of plan.*