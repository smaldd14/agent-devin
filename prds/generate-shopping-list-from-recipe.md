<!--
  PRD: Generate Shopping List from Recipe
  Date: 2025-05-16
  Version: 1.0
-->

# Product Requirements Document: Generate Shopping List from Recipe

## Overview and Purpose

### Feature Description
The API will generate a shopping list by sending recipe details (ingredients, quantities, units) and the user's current inventory to an LLM. The LLM will analyze these inputs and return a structured list of items that need to be ordered, including brand suggestions and units suitable for ordering on Amazon Fresh.

### Problem Statement
Home cooks manually cross-reference recipe ingredients against pantry inventories to determine what to buy, which is time-consuming and prone to errors. An LLM-powered solution can offload this logic and provide rich shopping lists instantly.

### Goals and Objectives
- Automate missing item detection via LLM.
- Provide brand and unit suggestions tailored for Amazon Fresh.
- Deliver results in JSON format ready for UI integration and persistence.
- Ensure high accuracy and performance.

- Goal 1: LLM-based list completeness ≥ 95%.
- Goal 2: API latency ≤ 3 seconds (95th percentile).
- Goal 3: Response schema validation pass rate ≥ 99%.

### Target Audience
Home cooks and meal planners who maintain digital pantry inventories and want a seamless way to generate shopping lists.

## User Stories and Personas

### Personas
**Emily, Home Cook**
- Role: Casual cook
- Context: Maintains pantry inventory in-app
- Motivations: Quick grocery list generation
- Pain points: Manual list creation is error-prone

**Michael, Meal Prep Enthusiast**
- Role: Organized planner
- Context: Plans weekly menus based on recipes
- Motivations: Efficient shopping trips
- Pain points: Complex spreadsheets and manual cross-checking

### User Stories
1. As a home cook, I want to send my recipe and inventory to the app so that I can generate a shopping list without manual calculations.
2. As a user, I want brand suggestions for each missing ingredient so that I can choose quality products on Amazon Fresh.
3. As a user, I want the output in JSON so that my UI can render and persist the shopping list.

## Functional Requirements

### Core Functionality

#### Requirement 1: Data Aggregation
- Description: Retrieve the recipe's ingredients and the user's inventory items from D1 (SQLite).
- Acceptance Criteria:
  - [ ] API correctly fetches full ingredient list (name, quantity, unit) for given `recipeId`.
  - [ ] API fetches all current inventory items (name, available quantity, unit).

#### Requirement 2: LLM-Based Missing Item Computation
- Description: Construct a structured prompt combining recipe ingredients and inventory data, send to the LLM (e.g., OpenAI), and parse the JSON response.
- Acceptance Criteria:
  - [ ] Prompt includes recipe name, ingredients, quantities, units, and inventory details.
  - [ ] LLM returns valid JSON array of missing items with fields: `itemName` (string), `quantity` (number), `unit` (string), `brand` (string).
  - [ ] Application validates and handles JSON parsing errors.

#### Requirement 3: Shopping List Persistence
- Description: Store the generated shopping list and its items in `shopping_lists` and `shopping_list_items` tables, including a reference to the LLM source.
- Acceptance Criteria:
  - [ ] Persisted shopping list with timestamp and `source: 'llm-delta'`.
  - [ ] Each item stored with `item_name`, `quantity`, `unit`, and `brand`.
  - [ ] API returns the new `shoppingListId` and items in the response.

### API Requirements
- Endpoint: `POST /api/shopping-lists/generate`
- Request Body:
  ```json
  { "recipeId": number }
  ```
- Response Body:
  ```json
  {
    "shoppingListId": number,
    "items": [
      {
        "itemName": string,
        "quantity": number,
        "unit": string,
        "brand": string
      }
    ]
  }
  ```

## Technical Considerations & Next Steps
- The UI layer will generate `amazonFreshUrl` client-side using the returned `itemName` and `brand`.