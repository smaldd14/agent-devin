# Display Saved Shopping Lists Implementation Plan

## Issue #10: Display saved shopping lists

**Title:** Display saved shopping lists

**Description:**
- Currently the `/shopping-lists` page/UI does not render any of the saved lists.
- Users need to be able to:
  - View a list of all saved shopping lists
  - Click on a particular shopping list to see its items
  - Mark items as completed (optional, for check-off)
  - Basic CRUD: Create, Read, Update, Delete lists and items

## Goals
1. Surface the existing `/api/shopping-lists` data on a new front-end page.
2. Allow users to open and review list items in a reusable drawer or detail view.
3. Enable marking items off (UI-only or persisted via API).
4. Lay groundwork for full CRUD (delete list, add/edit items).

## High-Level Solution
We will leverage the existing backend endpoints and the reusable `ShoppingListDrawer` component to build a new “Shopping Lists” page.

-### Backend Changes
- Update GET `/shopping-lists` to support pagination via query params `?page=<n>&perPage=<m>` and return paged data along with total count.
- GET `/shopping-lists/:id` remains unchanged.
- (Future) Consider adding:
  - DELETE `/shopping-lists/:id`
  - PATCH/PUT `/shopping-lists/:id/items/:itemId`
  - DELETE `/shopping-lists/:id/items/:itemId`

### Frontend Changes
1. **Services** (`src/react-app/services/shopping-lists.ts`)
   - Add `getShoppingLists(page?: number, perPage?: number)` → fetch paginated list summary with metadata `{ lists, total, page, perPage }`
   - Add `getShoppingList(id)` → fetch items for a specific list
2. **Router** (`src/react-app/router/index.tsx`)
   - Add route `/shopping-lists` pointing to new `ShoppingListsPage`
   - Add navigation link in `Navigation` component
3. **Page Component** (`src/react-app/pages/ShoppingLists/index.tsx`)
   - On mount, call `getShoppingLists(page, perPage)`
   - Render list of lists with pagination controls
   - On click, navigate to detail route `/shopping-lists/:id`
4. **Detail Page** (`src/react-app/pages/ShoppingLists/[id].tsx`)
   - Fetch list items via `getShoppingList(id)` on mount
   - Render items inline (table or list) with checkboxes for completion
   - Include action buttons: Generate Amazon Fresh Link, Save List
5. **Styling / UI polish**
   - Match cards to existing design system
   - Display timestamps in user-friendly format

## Tasks
1. Extend `src/react-app/services/shopping-lists.ts`:
   - Implement `getShoppingLists(page, perPage)` for paginated fetch
   - Implement `getShoppingList(id)` for detail fetch
2. Update `Navigation` to include a “Shopping Lists” link.
3. Add new React page under `src/react-app/pages/ShoppingLists`:
   - Fetch paginated lists via `getShoppingLists(page, perPage)`
   - Display results in a paged table or grid
   - Provide pagination controls (prev/next or page numbers)
   - Manage loading, error, and empty states
4. Implement detail page under `src/react-app/pages/ShoppingLists/[id].tsx`:
   - Fetch items via `getShoppingList(id)` on mount
   - Display items in a table or list with checkboxes
   - Provide action buttons for Amazon Fresh link and saving edits
5. (Optional stretch) Add checkboxes to item rows and persist via API.

---
This plan will address issue #10 by wiring up the saved shopping-lists data to a user-facing UI, enabling discovery and review of lists. Future steps can build on this foundation to offer full CRUD and completion tracking.