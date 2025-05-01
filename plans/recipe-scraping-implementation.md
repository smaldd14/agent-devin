 # Plan: Recipe URL Scraping Feature Implementation

 This document outlines the phases, milestones, tasks, timeline estimates, dependencies, and risks for implementing the Recipe URL Scraping feature as defined in `prds/recipe-scraping.md`.

 ## 1. Overview
 - **Goal:** Allow users to import online recipes by pasting a URL, scrape and parse the page via Cloudflare Browser Rendering, offer a preview/edit interface, and persist confirmed recipes to D1.
 - **Primary Components:**
   1. Browser Rendering Worker binding for headless page rendering
   2. Hono API endpoint `/api/recipes/scrape` for fetching and parsing
   3. React UI pages for URL input and preview/confirm
   4. D1 persistence via existing `recipes` and `recipe_ingredients` tables

 ## 2. Milestones & Phases

 ### Phase 1: Spike / Proof of Concept (1 week)
 - Prototype Browser Rendering fetch using both REST API and Workers Binding API
 - Parse rendered HTML for sample recipe URLs using Cloudflare puppeteer library (title, ingredients, instructions)
 - Evaluate performance and identify common parsing challenges

 ### Phase 2: Backend & API (1 week)
 - Add Browser Rendering binding in `wrangler.json` and configure any required secrets
 - Implement `POST /api/recipes/scrape` in Hono Worker:
   - Validate URL input (Zod schema)
   - Call Browser Rendering service to retrieve HTML
   - Parse HTML into a `RecipeDraft` object
   - Return `{ recipe: RecipeDraft, errors: string[] }`
 - Write unit tests for controller logic with mocked binding and parser

 ### Phase 3: Front-End UI (1 week)
 - Create `/recipes/import` React page with URL input and Scrape button
 - Build preview/edit form (`ScrapePreview` component) populated with extracted fields
 - Integrate API call via `services/api.ts` and handle loading/error states
 - Implement Save/Cancel actions: POST confirmed data to `/api/recipes`
 - Add basic UI tests for import and preview workflows

 ### Phase 4: QA & Testing (1 week)
 - End-to-end tests (Miniflare + Vite) covering scrape and save flows
 - Performance testing: measure scrape latency, tune timeouts
 - Security review: sanitize scraped content, validate inputs
 - Accessibility audit (axe-core) on new pages

 ### Phase 5: Rollout & Monitoring (0.5 week)
 - Feature-flag deployment to a subset of users
 - Update documentation (`codex.md`, `prds/recipe-scraping.md`, this plan)
 - Monitor scrape success rate, latency, error logs
 - Iterate parser heuristics based on failure patterns

 ## 3. Tasks & Subtasks

 **Phase 1:**
 - Set up minimal Worker script to invoke Browser Rendering and log HTML
 - Write puppeteer scripts to extract recipe fields for 5 popular sites
 - Document parsing edge cases and performance metrics

 **Phase 2:**
 - Define Zod schema: `{ url: string }`
 - Register Browser Rendering binding in `wrangler.json`
 - Create `src/worker/controllers/recipes-scrape.ts`
 - Integrate puppeteer parsing logic and error handling
 - Add route in `src/worker/routes/recipes.ts`
 - Develop unit tests with mocks for binding and parser

 **Phase 3:**
 - Implement `ImportRecipe.tsx` page and URL form
 - Create `ScrapePreview.tsx` with editable fields (title, ingredients, times, nutrition)
 - Wire up API calls in `services/api.ts`
 - Add Spinner and Error components to handle states
 - Write React Testing Library tests for workflows

 **Phase 4:**
 - Author E2E test scripts simulating user flow
 - Benchmark and log latency; adjust Ky/Worker timeouts
 - Run security linting and audit scraping output for XSS
 - Perform accessibility scans and address violations

 **Phase 5:**
 - Add endpoint entry to `codex.md`
 - Final review of PRD and plan files
 - Deploy changes via `npm run build` & `wrangler publish`
 - Set up basic logging/metrics (e.g., errorRate, avgLatency)

 ## 4. Timeline Estimates
 - Phase 1: 1 week
 - Phase 2: 1 week
 - Phase 3: 1 week
 - Phase 4: 1 week
 - Phase 5: 0.5 week

 ## 5. Dependencies & Risks
 **Dependencies:**
 - Cloudflare Browser Rendering service and binding configuration
 - Cheerio (or similar) HTML parser
 - Existing D1 schema for recipes

 **Risks:**
 - **HTML Structure Changes:** Frequent site updates may break parsers; mitigate with preview/edit and failure logging
 - **Browser Rendering Limits/Costs:** Rate limits or costs could spike; mitigate by caching and rate limiting
 - **Parsing Accuracy:** Inconsistent markup may lead to missing fields; mitigate via manual edit UI and iterative heuristics

 ---
 *End of plan.*