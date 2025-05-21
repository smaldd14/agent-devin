# Meal Plan Feature Implementation Plan

## Context
GitHub Issue #8: Introduce a weekly meal planning interface at the `/plan` endpoint. Users should:
- View a grid for the upcoming week (Monday–Sunday)
- Click a day to assign a recipe from their existing recipe list (days may remain blank)
- After selecting recipes, click “Generate Shopping List” (uses the already-implemented API)
- See and edit the consolidated shopping list in a dialog/drawer (reuse existing component)
- Persist meal plans in a new database table for future retrieval and editing

## Goals
1. Design and apply a database schema for storing per-day meal plans.
2. Expose backend endpoints to GET and POST weekly meal plans.
3. Build a responsive frontend page under `/plan`:
   - Shadcn-based grid for days
   - Recipe picker per day (dialog or dropdown)
   - “Save Plan” and “Generate Shopping List” actions
4. Integrate the existing shopping-list generation flow to aggregate across all selected recipes.
5. Ensure desktop and mobile UX consistency using Shadcn components and Tailwind mobile-first design.

## Scope
- Backend: D1 schema migration, repository, service, controllers, routes.
- Frontend: New page, hooks, UI components, API integration.

## High-Level Approach

1. Database Schema & Types
   - Create migration `migrations/202505XX_add_meal_plans.sql`:
     ```sql
     CREATE TABLE meal_plans (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       plan_date DATE NOT NULL,
       recipe_id INTEGER NOT NULL REFERENCES recipes(id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP
     );
     ```
   - Add TypeScript type in `src/types/meal-plan.ts`:
     ```ts
     export interface MealPlanItem {
       id: number;
       planDate: string; // ISO date (YYYY-MM-DD)
       recipeId: number;
     }
     export type WeeklyMealPlan = MealPlanItem[];
     ```

2. Backend Implementation
   - **Repository**: `src/worker/repositories/MealPlanRepository.ts`
     • `getPlanByWeek(startDate: string): MealPlanItem[]`
     • `upsertPlanItems(items: MealPlanItem[]): void`
   - **Service**: `src/worker/services/MealPlanService.ts`
   - **Controllers**: `src/worker/controllers/meal-plans.ts`
     • `getWeeklyPlan` (GET `/plans?startDate=YYYY-MM-DD`)
     • `saveWeeklyPlan` (POST `/plans`, body: `WeeklyMealPlan`)
   - **Routes**: mount in `src/worker/routes/meal-plans.ts`

3. Frontend Implementation
   - **Types & Services**:
     • `src/types/meal-plan.ts`
     • `src/react-app/services/meal-plans.ts`: `getMealPlan`, `saveMealPlan`
   - **Hook**: `useMealPlan` in `src/react-app/hooks/useMealPlan.ts`
   - **Page**: `src/react-app/pages/MealPlan/index.tsx`
     • 7-day grid (Shadcn `Grid` or CSS grid)
     • Cell: selected recipe name or “+ Add” button
     • Dialog picker for recipes
     • Bottom bar: “Save Plan” + “Generate Shopping List”
   - **Shopping List Aggregation**:
     • Collect recipeIds from plan
     • Call `/shopping-lists/generate` per recipe and merge quantities
     • Reuse `GenerateShoppingListDrawer` for display/editing

## Detailed Task Breakdown
| Task                                   | Owner        | Est. Effort |
|----------------------------------------|--------------|-------------|
| DB migration for `meal_plans` table    | Backend Dev  | 0.5 day     |
| Define shared `meal-plan` types        | Full-Stack   | 0.25 day    |
| Implement Repository & Service         | Backend Dev  | 1 day       |
| Add controllers & routes for `/plans`  | Backend Dev  | 0.5 day     |
| Frontend types & services wrappers     | Frontend Dev | 0.5 day     |
| Create `useMealPlan` hook              | Frontend Dev | 0.5 day     |
| Build MealPlan page & grid UI          | Frontend Dev | 1 day       |
| Recipe picker dialog integration       | Frontend Dev | 0.5 day     |
| Save & load plan flows                 | Full-Stack   | 0.5 day     |
| Shopping-list aggregation & drawer     | Frontend Dev | 0.5 day     |
| Responsive QA & polish                 | Frontend Dev | 0.5 day     |

## Dependencies & Risks
- Requires recipe listing API.
- Client-side merging of shopping lists may need backend support for complex cases.
