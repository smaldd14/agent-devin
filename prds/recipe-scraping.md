 # Product Requirements Document: Recipe URL Scraping Feature

 ## Overview and Purpose

 ### Feature Description
 Implement a recipe scraping feature that accepts a user-pasted URL in the UI, scrapes the target webpage using Cloudflare Browser Rendering, and extracts structured recipe data including title, ingredients, instructions, cooking time, prep time, total time, serving size, nutritional facts, and images. Provide a preview interface for users to confirm and edit scraped data before saving to D1.

 ### Problem Statement
 Users currently enter recipes and ingredients manually, which is time-consuming and error-prone. They lack a straightforward way to import recipes from popular cooking websites into the app.

 ### Goals and Objectives
 - Enable users to import recipes by pasting a URL, reducing manual data entry.
 - Extract core recipe fields (title, ingredients, instructions) and metadata (times, serving size, nutritional facts, images) with ≥80% accuracy on top recipe sites.
 - Present a preview/edit interface before saving, ensuring data correctness.
 - Complete scrape and parsing within 5 seconds for 90% of requests.

 ### Target Audience
 Home cooks and meal planners who discover recipes online and want to import them quickly into their digital cookbook and inventory system.

 ## User Stories and Personas

 ### Personas
 **Persona 1: Busy Home Cook Carla**
 - Role: Prepares family meals on a tight schedule
 - Context: Finds recipes on blogs and cooking sites
 - Motivations: Save time by importing recipes directly instead of manual entry
 - Pain points: Manual copy-paste leads to errors and slows her down

 **Persona 2: Aspiring Chef Alex**
 - Role: Curates and tests new dishes from various online sources
 - Context: Tracks ingredients and instructions digitally for repeatability
 - Motivations: Quickly import and manage recipes in one place
 - Pain points: Copy-paste formatting breaks and requires cleanup

 ### User Stories
 1. As a home cook, I want to paste a recipe URL so that I can quickly import the recipe into my collection.
 2. As a user, I want to see a preview of the scraped recipe so I can confirm and edit any fields before saving.
 3. As a user, I want to edit extracted fields (ingredients, times, serving size, nutrition) so that the recipe is accurate.
 4. As a user, I want to save the confirmed recipe to my account so that it is persisted in my D1 database.

 ## Functional Requirements

 ### Core Functionality

 #### Requirement 1: URL Input and Submission
 - Description: In the React UI, add an “Import Recipe” page with a URL input field and a “Scrape” button.
 - Acceptance Criteria:
   - [ ] Users can paste a valid URL and click “Scrape”.
   - [ ] Input validation rejects malformed URLs with an inline error.

 #### Requirement 2: Scraping API Endpoint
 - Description: Create `POST /api/recipes/scrape` endpoint in the Hono Worker that accepts `{ url: string }`.
 - Acceptance Criteria:
   - [ ] Endpoint invokes Cloudflare Browser Rendering Worker to render the page (per docs/browser-rendering/llms-full.txt).
   - [ ] Parses rendered HTML (using cloudflare's puppeteer) to extract:
     - title, ingredients (name, quantity, unit), instructions, prep_time, cook_time, total_time, serving_size, nutritional_info, images.
   - [ ] Returns JSON: `{ recipe: RecipeDraft, errors: string[] }` on success.
   - [ ] Handles invalid URLs, timeouts, and parsing failures with appropriate HTTP status codes and error messages.

 #### Requirement 3: Preview and Confirm UI
 - Description: After successful scrape, display a preview form populated with extracted data.
 - Acceptance Criteria:
   - [ ] Editable fields for all extracted recipe properties.
   - [ ] “Save” button persists confirmed data via `POST /api/recipes` to D1.
   - [ ] “Cancel” returns to the import page without saving.

 ### User Interactions
 1. User navigates to `/recipes/import`.
 2. User pastes URL and clicks “Scrape”.
 3. App shows loading spinner; on success, shows populated preview form; on error, shows descriptive message with retry option.
 4. User edits fields as needed and clicks “Save” to persist.

 ## Non-Functional Requirements

 ### Performance
 - Scrape and parse round-trip should complete within 5s for 90% of requests.
 - Support at least 20 concurrent scraping requests without significant degradation.

 ### Security
 - Sanitize all scraped content to prevent XSS in the preview form.
 - Obey robots.txt and site terms where possible; document any limitations.

 ### Compatibility
 - Scraping service must handle modern HTML5 sites.
 - UI components compatible with recent versions of Chrome, Firefox, and Edge.

 ### Accessibility
 - Follow WCAG AA standards for form inputs, buttons, and error states on the import and preview pages.

 ## UI/UX Specifications

 ### User Interface
 - New route: `/recipes/import`.
 - URL input field with placeholder “Paste recipe URL here”.
 - “Scrape” button and loading spinner.
 - Preview form:
   - Title (text input)
   - Image URLs (sortable list)
   - Ingredients table (name, quantity, unit)
   - Instructions (rich text or textarea)
   - Prep, cook, total times (numeric inputs)
   - Serving size (numeric input)
   - Nutritional facts (collapsible section)
 - Action buttons: “Save Recipe” and “Cancel”.

 ### User Experience
 - Instant validation feedback on URL input.
 - Clear messaging on scrape successes and failures.
 - Auto-scroll to first validation error or missing field in preview.

 ## Technical Considerations

 ### System Architecture
 1. React front-end calls Hono Worker at `POST /api/recipes/scrape`.
 2. Hono Worker fetches rendered HTML from Browser Rendering Worker (binding configured in wrangler.json).
 3. Hono Worker parses HTML and returns structured JSON.
 4. Front-end displays preview form and, on save, calls `POST /api/recipes` to persist in D1.

 ### API Requirements
 1. `POST /api/recipes/scrape`
    - Request body: `{ url: string }`
    - Response: `{ recipe: RecipeDraft, errors: string[] }`
 2. `POST /api/recipes`
    - Request body: confirmed `RecipeDraft`
    - Response: saved recipe record

 ### Data Requirements
 - Reuse existing `recipes` and `recipe_ingredients` tables in D1.
 - Add optional columns to `recipes`: `serving_size` (INTEGER), `nutrition_info` (JSON).

 ### Dependencies
 - Cloudflare Browser Rendering binding (documentation in docs/llms.txt and docs/browser-rendering/llms-full.txt).
 - Cheerio or equivalent HTML parser in the Worker bundle.
 - Wrangler secret/API key for Browser Rendering if required.

 ## Success Metrics

 - Scraped recipes per week ≥ 50 within first month.
 - Successful scrape rate ≥ 80% on top 20 recipe websites.
 - Average scrape latency < 5s.
 - User satisfaction rating ≥ 4/5 via in-app survey.

 ## Implementation Plan

 **Phase 1: Spike/POC (1 week)**
 - Prototype Browser Rendering fetch and Cheerio parsing for 5 popular sites.
 - Validate performance and accuracy.

 **Phase 2: Backend/API (1 week)**
 - Implement `POST /api/recipes/scrape` endpoint with error handling.
 - Write unit tests for parsing logic.

 **Phase 3: Front-End (1 week)**
 - Build `/recipes/import` page with preview form, loading and error states.
 - Integrate save flow to persistence endpoint.

 **Phase 4: QA & Testing (1 week)**
 - End-to-end tests with representative URLs.
 - Cross-browser and accessibility testing.
 - Monitor and tune performance.

 **Phase 5: Rollout (1 week)**
 - Feature flag deployment to 10% users.
 - Collect metrics and refine.

 ## Out of Scope
 - OCR or image-based text extraction from non-HTML sources.
 - Multilingual recipe support beyond English.
 - Advanced nutritional analysis (beyond basic facts).

 ## Assumptions and Risks

 ### Assumptions
 - Cloudflare Browser Rendering service is available and stable in production.
 - Recipe sites follow consistent HTML structures and metadata schemas.
 - Cheerio-based parsing is sufficient for core data extraction.

 ### Risks
 | Risk                                    | Impact | Likelihood | Mitigation                                                         |
 |-----------------------------------------|--------|------------|--------------------------------------------------------------------|
 | Site HTML structure changes frequently  | High   | Medium     | Provide editing UI; log failures to improve parsing heuristics.    |
 | Browser Rendering API rate limits/costs | Medium | Medium     | Monitor usage; implement caching and rate limiting.               |
 | Parsing inaccuracies                    | High   | Medium     | Allow manual edits; track common errors for parser enhancements.  |

 ## Appendix

 ### Related Documents
 - Cloudflare Browser Rendering general docs: `docs/llms.txt`
 - Browser Rendering API details: `docs/browser-rendering/llms-full.txt`

 ### Glossary
 - D1: Cloudflare’s edge SQLite database
 - Cheerio: Server-side HTML parsing library
 - Robot Exclusion Protocol: Standard for controlling crawler access

 ### References
 - Schema.org Recipe schema
 - Cloudflare Browser Rendering API reference