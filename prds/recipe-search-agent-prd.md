<!--
  PRD: Recipe Search Agent
  Date: 2025-05-01
  Version: 1.0
-->

# PRD: Recipe Search Agent

## 1. Overview

Build a Cloudflare Agent that automatically discovers and returns web-based recipes matching the proteins available in our inventory. The agent will provide users with a curated list of recipe suggestions, each including a title, image, link, and short description.

## 2. Problem Statement

Users maintain a list of proteins in their pantry but currently have no integrated way to discover recipes that leverage those ingredients. Manual searches across multiple websites are time-consuming and inefficient.

## 3. Goals & Objectives

- Surface relevant recipe suggestions based on available proteins.
- Deliver concise recipe metadata: title, image, link, description.
- Integrate seamlessly into existing React UI and API backend.
- Cache results to optimize performance and API usage.

## 4. Non-Goals

- Full meal planning (combining multiple proteins/ingredients).
- Managing shopping lists for missing ingredients.

## 5. User Stories

- As a user, I can view recipe suggestions for each protein in my inventory.
- As a user, I can click a recipe to navigate to the source website.
- As a user, I see an image and a short description for each recipe.

## 6. Functional Requirements

1. **Inventory Extraction**: Read all `inventory_items` where `is_protein = 1` and `quantity > 0`.
2. **Agent Endpoint**: Expose `GET /api/recipes/recommendations` (or RPC `getRecommendations`) that triggers the recipe agent.
3. **Web Search Integration**: Use a third-party search API (e.g., Bing Search API, Spoonacular) to find top N recipes per protein.
4. **Data Extraction**: For each recipe, capture:
   - `title` (string)
   - `url` (string)
   - `image_url` (string)
   - `description` (string)
5. **Caching Layer**: Leverage Cloudflare Workers KV to store and retrieve cached recommendations per protein with a configurable TTL (e.g., 6 hours).
6. **Response Format**:
   ```json
   [
     {
       "protein": "chicken",
       "title": "Grilled Lemon Chicken",
       "url": "https://...",
       "image_url": "https://...",
       "description": "Juicy chicken breasts marinated in lemon..."
     },
     ...
   ]
   ```

## 7. Non-Functional Requirements

- **Latency**: ≤2s for cached responses; ≤5s for cold fetch.
- **Scalability**: Support 100+ concurrent users.
- **Security**: Sanitize external content; store API keys and KV bindings as Wrangler secrets.
- **Observability**: Log requests and errors via Wrangler tail; monitor metrics.
- **Extensibility**: Easily extend to other ingredient categories.

## 8. Architecture & Tech Stack

- **Agent**: `RecipeSearchAgent` extending Cloudflare Agents SDK.
- **KV**: Use Workers KV namespace (e.g., `RECIPE_CACHE_KV`) to cache recipe lists per protein.
- **Search API**: Cloudflare AI Gateway binding to external search service or direct HTTP requests.
- **UI**: React component calling `agentFetch` or REST endpoint `/api/recipes/recommendations`.

## 9. Caching & Storage

Leverage a KV namespace binding `RECIPE_CACHE_KV` with:
- Key: protein name (e.g., `protein:chicken`).
- Value: JSON-stringified array of recipe objects.
- TTL: Configurable (e.g., 6 hours) via `expirationTtl` on `KV.put`.

Cache Flow:
1. On request, check `kv.get(key)`.
2. If cached and not expired, return cached value.
3. Otherwise, fetch fresh results, store in KV, then return.

## 10. API Design

- **GET /api/recipes/recommendations**
  - Query params: `proteins` (optional comma-separated list)
  - Response: JSON array of recipe objects

- **Agent RPC**: `getRecommendations(proteins: string[]): Recipe[]`

## 11. Third-Party Integrations

- **Search API**: Bing Search, Spoonacular, or equivalent (configurable via env).

## 12. Security & Compliance

- Store API credentials as Wrangler secrets.
- Validate and sanitize all external URLs and content.

## 13. Milestones & Timeline

| Milestone                                 | Duration   |
|-------------------------------------------|------------|
| Design & schema definition                | 1 week     |
| Agent scaffolding & search integration    | 2 weeks    |
| KV caching implementation                 | 1 week     |
| API & UI integration                      | 2 weeks    |
| Testing, QA, and deployment               | 1 week     |

## 14. KPIs & Success Metrics

- **Usage**: # of recommendation requests per day.
- **Performance**: Average response time.
- **Cache Hit Rate**: % of requests served from KV.

## 15. Risks & Mitigations

- **Rate Limits**: Implement exponential backoff; cache aggressively.
- **Search API Costs**: Monitor usage; adjust plan or switch providers.

## 16. Future Enhancements

- Dietary filters (vegetarian, gluten-free).
- Generate shopping list for missing ingredients.
- User feedback on recipe quality.