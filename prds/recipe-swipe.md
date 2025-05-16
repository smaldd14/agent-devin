 # PRD: Recipe Swipe Feature

 ## 1. Purpose and Overview
 Enable users to discover new recipes through an engaging, Tinder-like “swipe” interface. Users swipe right to save recipes they like or left to skip, creating a personalized collection and preference profile that powers future recommendations.

 ## 2. Background and Problem Statement
 - Users spend significant time browsing multiple recipe sites, often overwhelmed by choices and lacking a streamlined discovery experience.
 - Existing browsing is passive; users may miss recipes that align with their tastes.

 ## 3. Goals and Success Metrics
 ### Goals
 - Increase user engagement and time spent discovering recipes.
 - Surface diverse recipes matching individual preferences.
 - Grow saved-recipe collections over time.

 ### Success Metrics (KPIs)
 - Swipe sessions per user per week.
 - Average number of likes (right swipes) per session.
 - Percentage of liked recipes viewed or cooked.
 - Retention lift: return rate of users who try swiping.
 - Cache hit rate on recipe API calls.

 ## 4. User Personas
 - **Casual Cook Carla**: Enjoys exploring new dishes but wants a fast, fun way to find ideas.
 - **Health-Conscious Henry**: Seeks recipes that match dietary filters (e.g., low-carb, vegetarian).
 - **Meal Planner Mia**: Builds meal collections for the week by saving multiple recipes.

 ## 5. User Stories & Use Cases
 - As a user, I want to swipe through recipes one by one so I can quickly discover new dishes.
 - As a user, I want to save liked recipes to my collection so I can access them later.
 - As a health-conscious user, I want to filter recipes by attributes (vegetarian, gluten-free) before swiping.
 - As a user, I want the next recipe to preload so my experience feels seamless.

 ## 6. Functional Requirements
### Swipe Interface
- Display one recipe card at a time showing:
  - High-quality image of the dish
  - Recipe name/title
  - Cook time (prep + cook)
  - Difficulty level
- Support right swipe (save/like) and left swipe (skip/pass).
- Clicking or tapping on the card (or the like action) opens the full recipe on the external source website in a new tab.
- Include an “Undo” option to revert the last swipe.

 ### Saved Recipes Collection
 - Persist liked recipes under the user’s profile.
 - Allow categorization (e.g., breakfast, dinner, dessert).

 ### Filtering and Personalization
 - Users can select dietary attributes before beginning a session.
 - Swipe history feeds a recommendation algorithm to adjust future recipe ordering.

 ## 7. Technical Implementation
 ### Data Source and Parsing
 - Integrate with external recipe search API (e.g., Brave Search) for broad coverage.
 - Parse structured data (title, image, prep time, difficulty, attributes) from recipe sites.

 ### Caching and Performance
 - Use Cloudflare KV to cache API search results and parsed recipe metadata.
 - Define cache TTL (e.g., 6 hours) and cache invalidation strategy.
 - Preload the next recipe card during the user’s current interaction.

 ### Display Options
 - **Rich Card Preview**: Render parsed metadata in our standardized card UI.
 - **Web Preview**: Optionally embed the source site in an iframe with overlay controls.

 ### Storage and Personalization
 - Save likes/dislikes in D1 (SQLite) or KV per user.
 - Track swipe timestamps and outcomes for recommendation modeling.

 ### Compliance and Quality
 - Ensure recipe source attribution and adherence to source terms of use.
 - Handle paywalled or login-required sites gracefully (skip or show notice).

 ## 8. UX/UI Considerations
 - Design responsive card layout for desktop and mobile.
 - Animate swipe interactions for delight and clarity.
 - Display a progress indicator (e.g., “5 of 20”) if batching.

 ## 9. Dependencies and Risks
 - Availability and rate limits of external recipe APIs.
 - Complexity of parsing structured data across heterogeneous sites.
 - Potential copyright/compliance issues with source terms.

 ## 10. Timeline and Milestones
 | Phase                | Duration | Milestone                          |
 |----------------------|----------|------------------------------------|
 | Design & Prototyping | 1–2 weeks| UX mocks and wireframes approved   |
 | Backend Integration  | 2–3 weeks| API integration, parsing, caching  |
 | Frontend Development | 2 weeks  | Swipe UI, animation, save flow     |
 | Personalization      | 1–2 weeks| Filtering & basic recommendations  |
 | Testing & QA         | 1 week   | UX, performance, compliance testing|
 | Launch & Monitoring  | 1 week   | Rollout and metrics tracking       |

 ## 11. Open Questions
 - Which external recipe API provides the best coverage and permissive terms?
 - What default batch size of recipes should we load per session?
 - How will we handle recipe updates or deletions upstream?
 - Should onboarding include a brief tutorial for the swipe interface?