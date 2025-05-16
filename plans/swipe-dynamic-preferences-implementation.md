# Swipe Page Dynamic Preferences Implementation Plan

## Overview
Currently, users of the /swipe page select their recipe preferences (dietary, cuisine, etc.) once before beginning to swipe recipe cards. To improve flexibility and user control, we want to allow users to modify their preferences on the fly—without leaving the swipe experience—and re-initiate the card deck based on the updated filters.

## Goals
- Enable desktop users to open a sidebar at any time to adjust filters and re-fetch cards.
- Enable mobile users to open a ShadcnUI Sidebar component for the same filter adjustments.
- Upon submitting new preferences, restart the swipe session with updated filters and reset the deck.
- Preserve existing swipe UX (gestures, undo, progress indicators).

## Requirements
**Functional:**
- A toggle button in the swipe header to open/close the filter UI.
- Use the existing `Sidebar` component (`src/react-app/components/ui/sidebar.tsx`) for both desktop and mobile.
- Submitting the form re-runs `initSwipeSession` with new filters.
- Filter UI should pre-fill with the current preferences.

**Non-Functional:**
- Responsive design: built-in support via the ShadcnUI `Sidebar` component.
- Accessibility: focus trap in sidebar/drawer, keyboard navigation.
- Minimal disruption: clear indication that swipes are reset when filters change.

## Proposed Solution
1. Extract the existing filter form into a reusable `PreferencesForm` component.
2. Embed `PreferencesForm` inside the existing ShadcnUI `Sidebar` component.
3. In `SwipePage` (`src/react-app/pages/Swipe/index.tsx`):
   - Add state: `preferences`, `isPreferencesOpen`.
   - Render an “Edit Filters” button in the header to toggle `isPreferencesOpen`.
   - Use `Sidebar` component with `isOpen` prop to show/hide the filter UI.
   - Pass current `preferences` to `PreferencesForm` via `initialValues`.
   - On submit, update `preferences` state, call `initSwipeSession(preferences)`, close sidebar, and reset swipe deck state.
4. Extend `useSwipeSession` hook (`src/react-app/hooks/useSwipeSession.ts`) to accept `preferences` as a dependency and re-initialize when they change.
5. Keep service API calls in `src/react-app/services/swipe.ts` unchanged.

## UI/UX Design
- **Desktop & Mobile:** The ShadcnUI `Sidebar` component handles responsiveness (collapsible on desktop, overlay on mobile).  
- **Toggle:** Place an “Edit Filters” icon/button in the swipe page header.
- **Feedback:** Show a toast or banner (“Filters updated, deck refreshed”) when preferences change.

## Implementation Steps
1. Create `PreferencesForm.tsx` in `src/react-app/components/swipe/`:
   - Props: `initialValues`, `onSubmit(values)`.
   - Use ShadcnUI `Checkbox`, `Select`, `Button`.
2. Update `src/react-app/pages/Swipe/index.tsx`:
   - Import `Sidebar` and `PreferencesForm`.
   - Manage `preferences` and `isPreferencesOpen` state.
   - Add toggle button and wire `Sidebar` open/close.
   - Handle form submit to re-init session.
3. Refactor `useSwipeSession` to take `preferences` as input and re-run init logic on change.
4. Add UI feedback (e.g., toast) when filters are applied.
5. Test manually on desktop and mobile breakpoints.
6. Write unit tests for `PreferencesForm` and integration tests for `SwipePage`.

## Timeline
- Day 1: Extract `PreferencesForm`, integrate with `Sidebar`, basic functionality.
- Day 2: Extend hook, add feedback, QA on devices.
- Day 3: Accessibility audit, tests, documentation.

## Risks & Mitigations
- **State sync issues:** Ensure swipe deck resets cleanly—clear previous session state in hook.
- **User confusion:** Provide clear visual feedback on preference updates.
- **Edge cases:** Test missing or invalid filters; fall back to default behavior.

## Next Steps
- Review plan with team and finalize design details.
- Begin implementation following the steps above.


## References
- Local Sidebar component: src/react-app/components/ui/sidebar.tsx
- Sidebar docs: docs/shadcn/sidebar/llmsfull.txt
