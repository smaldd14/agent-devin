# Generate Shopping List From Recipe - Frontend Implementation Plan

## Context
The backend API for generating a shopping list from a recipe is live (`src/worker/controllers/shopping-lists-generate.ts`). We now need to integrate this feature into the Recipe Detail frontend, prioritizing mobile-first UX while maintaining desktop polish.

## Goals
1. Add a “Generate Shopping List” trigger on the Recipe Detail page using Shadcn’s `Button`.
2. Define a shared TypeScript type (`ShoppingListItem`) in `src/types/shopping-list.ts` and consume it in both backend and frontend to ensure type safety.
3. Use Shadcn UI components (`Dialog`/`Drawer`, `Form`, `Input`, `Table`, etc.) for all new UI elements.
4. Build a responsive dialog/drawer UI that looks and feels great on mobile (primary) and desktop.
5. Integrate the `AmazonFreshLink` utility to let users generate an Amazon Fresh link from their finalized list.

## High-Level Approach
1. **Shared Types**
   - Create `src/types/shopping-list.ts`:
     ```ts
     export interface ShoppingListItem {
       id: number;
       itemName: string;
       quantity: number;
       unit: string;
     }
     ```
   - Update `shopping-lists-generate.ts` to import and return this type.
2. **Hook & Service**
   - Under `src/react-app/hooks/useGenerateShoppingList.ts`, implement a hook that:
     - Calls the API via Ky
     - Manages `loading`, `data: ShoppingListItem[]`, and `error`
3. **RecipeDetail Integration**
   - In `src/react-app/pages/RecipeDetail.tsx`:
     - Import Shadcn `Button` and the hook.
     - Manage local state for drawer open/close.
4. **Drawer/Dialog Component**
   - Create `src/react-app/components/GenerateShoppingListDrawer.tsx`:
     - Use Shadcn’s `Dialog` or `Drawer` for the overlay.
     - Show a spinner (`Progress`) while `loading`.
     - On success, render an editable list using Shadcn `Table` and `Input`.
     - Ensure touch-friendly spacing and font sizes.
5. **Amazon Fresh Link**
   - In the drawer footer, use `createAmazonFreshLink(items: ShoppingListItem[])` to build the URL.
   - Render as a `Link` or `Button` that opens in a new tab.
6. **Responsive Design & Theming**
   - Use Tailwind’s mobile-first utility classes.
   - Verify on small screen breakpoints (e.g., 320px, 375px, 414px).
   - Maintain visual consistency with existing Shadcn theme tokens.

## Detailed Task Breakdown
| Task                                                       | Owner          | Est. Effort |
|------------------------------------------------------------|----------------|-------------|
| Define shared type in `src/types/shopping-list.ts`         | Frontend Dev   | 0.5 day     |
| Update backend controller to return `ShoppingListItem[]`   | Backend Dev    | 0.25 day    |
| Implement `useGenerateShoppingList` hook                   | Frontend Dev   | 0.5 day     |
| Extend `RecipeDetail.tsx` with Shadcn `Button` & state      | Frontend Dev   | 0.25 day    |
| Build `GenerateShoppingListDrawer.tsx` with Shadcn UI      | Frontend Dev   | 1 day       |
| AmazonFreshLink integration & UI                          | Frontend Dev   | 0.5 day     |
| Responsive QA & polish                                     | Frontend Dev   | 0.5 day     |
| (Optional) Unit tests for hook logic                      | Frontend Dev   | 0.5 day     |

---
*After plan approval, switch to a feature branch (`feat/shopping-list-frontend`) and implement.*