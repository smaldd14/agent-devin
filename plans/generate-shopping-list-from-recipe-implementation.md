 # Plan: Generate Shopping List From Recipe Implementation

 This document outlines the architecture, modular components, phases, tasks, timeline estimates, dependencies, and best practices for implementing the Generate Shopping List from Recipe API backend feature as defined in `prds/generate-shopping-list-from-recipe.md`.

 ## 1. Architecture & High-Level Design
 - Separation of concerns into layers:
   - Data Access (Repository layer)
   - Business Logic (Service layer)
   - HTTP Interface (Controller/Route layer)
   - Utility modules (Prompt Builder, Schema Validation)
 - Hono framework for routing and middleware on Cloudflare Workers
 - D1 (SQLite) for persistent storage
 - OpenAI API for LLM-based missing-item computation

 ## 2. Module Breakdown
 **Data Access (repositories/)**
 - RecipeRepository.ts: fetch recipe and ingredients by `recipeId`
 - InventoryRepository.ts: fetch current inventory items
 - ShoppingListRepository.ts: persist shopping lists and items

 **Business Logic (services/)**n+ - PromptBuilder.ts: assemble structured prompt from recipe and inventory data
 - LLMService.ts: send prompt to OpenAI, receive and validate JSON response
 - ShoppingListService.ts: orchestrate data fetch, LLM call, persistence, and response mapping

 **Interface Layer (controllers/ & routes/)**n+ - ShoppingListController.ts: validate request, invoke ShoppingListService, handle errors
 - routes/shopping-lists.ts: define `POST /api/shopping-lists/generate`

 **Utilities**n+ - schemas/ShoppingListSchema.ts: Zod schemas for LLM response and API models
 - errors/CustomErrors.ts: domain-specific error classes (ValidationError, NotFoundError, LLMError)
 - config/index.ts: load and validate env vars (D1 binding, OpenAI key)

 ## 3. Data Flow
 1. Client calls `POST /api/shopping-lists/generate` with `{ recipeId }`.
 2. Controller validates input and user authentication.
 3. ShoppingListService:
    a. RecipeRepository retrieves recipe metadata and ingredients.
    b. InventoryRepository retrieves current inventory items.
    c. PromptBuilder constructs JSON prompt.
    d. LLMService calls OpenAI, parses and validates JSON array of missing items.
    e. ShoppingListRepository persists a new shopping list record and its items.
 4. Controller returns `{ shoppingListId, items }` to client.

 ## 4. Phases & Tasks
 | Phase                           | Duration | Deliverables                                         |
 |---------------------------------|----------|------------------------------------------------------|
 | 1. Scaffolding & Config         | 1 day    | D1 binding, env config, route stub, TS types         |
 | 2. Repository Layer             | 2 days   | Recipe, Inventory, ShoppingList repositories + tests |
 | 3. Prompt Builder & Schemas     | 1 day    | PromptBuilder, Zod schemas + unit tests              |
 | 4. LLM Integration              | 2 days   | LLMService with OpenAI client + mock tests           |
 | 5. ShoppingList Service         | 1 day    | Service orchestration + service-level tests          |
 | 6. Controller & Routing         | 1 day    | Controller, route registration + integration tests   |
 | 7. QA, Documentation & CI       | 1 day    | End-to-end tests, docs update, CI pipeline integration|

 **Total Estimate:** ~9 business days

 ## 5. Non-Functional Considerations
 - **Performance:** 95th percentile latency ≤ 3 seconds for recipes with ≤ 20 ingredients
 - **Security:**
   - Authenticate and authorize requests
   - Sanitize and validate all inputs and LLM outputs
 - **Scalability:** Design stateless services; D1 handles concurrency
 - **Logging:** Structured logs for request tracing and errors

 ## 6. Testing Strategy
 - **Unit Tests:**
   - Repositories with D1 mock/stub
   - PromptBuilder and schema validation
   - LLMService with OpenAI response mocks
   - ShoppingListService orchestration
 - **Integration Tests:**
   - Route-level tests with Miniflare and D1 binding
   - Error-path and edge-case coverage
 - **Contract Tests:** Validate API response schema against OpenAPI or Zod

 ## 7. Dependencies & Risks
 **Dependencies:**
 - Cloudflare Workers (Hono), D1 binding
 - OpenAI API credentials and network
 - Zod (or equivalent) for schema validation

 **Risks & Mitigations:**
 | Risk                      | Impact | Likelihood | Mitigation                               |
 |---------------------------|--------|------------|------------------------------------------|
 | LLM returns invalid JSON  | Med    | Med        | Strict Zod validation, retry or fallback |
 | Slow LLM response         | High   | Low        | Timeout settings, cached deltas fallback |
 | Inventory data discrepancies | High | Low        | Prompt user confirmation UI step         |

 ## 8. Best Practices
 - Use dependency injection to decouple components
 - Keep business logic in pure functions for testability
 - Centralize configuration and secrets management
 - Employ consistent error-handling patterns and logging
 - Document public interfaces and modules with JSDoc/TS types