# Plan: AI-Powered Recipe Generation Implementation

This plan details the phases, milestones, tasks, and dependencies for building the AI-powered recipe generation feature as outlined in `prds/ai-recipe-generation.md`.

## 1. Overview
- Goal: Enable users to generate personalized recipes and shopping lists based on pantry inventory and preferences via an AI LLM.
- Primary components:
  1. Backend endpoint (`POST /api/recipes/generate`) invoking the LLM
  2. React UI for preferences input and result display
  3. Prompt integration (using `recipe-generator.txt`)
  4. Secret management (LLM API key)

## 2. Milestones & Phases

### Phase 1: Backend & Prompt Integration
- Milestone 1.1: Add OpenAI SDK to Worker
- Milestone 1.2: Implement `generateRecipe` controller
- Milestone 1.3: Create new Hono route `/api/recipes/generate`
- Milestone 1.4: Write unit tests / smoke tests for endpoint

### Phase 2: Frontend UI
- Milestone 2.1: Add “Generate Recipes” page/screen
- Milestone 2.2: Build preferences form (max_recipes, cuisine, dietary)
- Milestone 2.3: Integrate API call via `services/api.ts`
- Milestone 2.4: Display loading, error, and results UI
- Milestone 2.5: Write basic UI tests

### Phase 3: Validation & QA
- Milestone 3.1: End-to-end testing (Miniflare + Vite)
- Milestone 3.2: Performance tuning (prompt size, timeouts)
- Milestone 3.3: Security audit (validate inputs, secret injection)
- Milestone 3.4: Accessibility review

### Phase 4: Documentation & Release
- Milestone 4.1: Update `codex.md` with new endpoint
- Milestone 4.2: Review/update PRD & plan docs
- Milestone 4.3: Draft release notes
- Milestone 4.4: Merge & deploy via Wrangler

## 3. Tasks & Subtasks

**Phase 1 Tasks:**
- Install & configure `openai` package in Worker (`npm install openai`).
- Store `OPENAI_API_KEY` via `wrangler secret put`.
- Load `recipe-generator.txt` at runtime and define prompt function.
- Create `src/worker/controllers/recipes-generator.ts` with logic:
  - Fetch inventory from D1
  - Read preferences from request body
  - Format prompt using the template
  - Call LLM API, parse response
  - Return structured JSON
- Add route in `src/worker/routes/recipes.ts`:
  ```js
  routes.post('/generate', validateSchema, generateRecipe);
  ```
- Write a minimal zod schema for `/generate` input.
- Unit test controller with mock D1 and mock LLM client.

**Phase 2 Tasks:**
- Create new React route/page under `src/react-app/pages/GenerateRecipes.tsx`.
- Build form components (max recipes, preferences textarea) using existing UI toolkit.
- Hook form state; call `services/api.post('recipes/generate', body)`.
- Create `GenerateRecipesResult.tsx` component to render recipes and shopping list.
- Implement loading spinner and error message UI.

**Phase 3 Tasks:**
- Write Cypress or Playwright E2E tests: simulate a generate flow with stubbed LLM.
- Benchmark endpoint response times; tune Worker timeout and Ky timeout.
- Validate all form inputs, prevent empty or invalid values.
- Audit for missing secrets or exposure.
- Perform axe-core accessibility scan on the new page.

**Phase 4 Tasks:**
- Append `/api/recipes/generate` entry to `codex.md`.
- Confirm `prds/ai-recipe-generation.md` is up-to-date.
- Draft release notes in `CHANGELOG.md` (if exists) or `RELEASE.md`.
- Use `npm run build` & `wrangler publish` to deploy.

## 4. Timeline Estimates
- Phase 1: 3 days
- Phase 2: 4 days
- Phase 3: 2 days
- Phase 4: 1 day

## 5. Dependencies & Risks
- **Dependencies:**
  - OpenAI (or chosen LLM) account and API key
  - `recipe-generator.txt` prompt completeness
  - D1 inventory table schema
- **Risks:**
  - LLM latency or cost spikes; mitigate by caching or limiting requests
  - Prompt size exceeding Worker limits; mitigate by summarizing inventory
  - Complex parsing of LLM output; define a strict response schema

---
*End of plan.*