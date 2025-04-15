# Recipe and Inventory Frontend Implementation Plan

## Overview

This document outlines the plan for implementing frontend pages for viewing recipes and inventory items in the application. The implementation uses React, TypeScript, React Router, and ShadcnUI components.

## Project Structure Analysis

The project is structured as follows:

1. **Backend (Worker API)**
   - Built with Hono.js
   - Provides REST API endpoints for recipes, inventory, and shopping lists
   - Uses SQLite (D1) for data storage

2. **Frontend**
   - React + TypeScript + Vite
   - Uses React Router for navigation
   - Implements ShadcnUI components for UI
   - Currently only has a basic Home page

## Implementation Plan

### 1. Create Type Definitions and API Services

- [x] **File: `/src/react-app/services/api.ts`**
  - [x] Implement a base API client with fetch
  - [x] Add error handling and response parsing

- [x] **File: `/src/react-app/services/recipes.ts`**
  - [x] Implement functions to fetch all recipes and individual recipe details
  - [x] Use the API types already defined in `src/types/api.ts`

- [ ] **File: `/src/react-app/services/inventory.ts`**
  - [ ] Implement functions to fetch all inventory items and individual item details
  - [ ] Use the API types already defined in `src/types/api.ts`

### 2. Create UI Components

#### Shared Components

- [x] **Use ShadcnUI components**
  - [x] Card component
  - [x] Button component
  - [x] Input component
  - [x] Badge component
  - [x] Skeleton component

- [x] **File: `/src/react-app/components/layout/PageHeader.tsx`**
  - [x] Page header component with title, description, and optional actions

- [x] **File: `/src/react-app/components/layout/Navigation.tsx`**
  - [x] Navigation component with links to Home, Recipes, and Inventory pages

#### Recipe Components

- [x] **File: `/src/react-app/components/recipes/RecipeCard.tsx`**
  - [x] Card component for displaying recipe information in grid/list view
  - [x] Display recipe name, cooking time, difficulty, and a truncated instruction preview

- [x] **File: `/src/react-app/components/recipes/RecipeDetail.tsx`**
  - [x] Component for displaying detailed recipe information
  - [x] Display full recipe instructions, ingredients list, cooking time, and difficulty

#### Inventory Components

- [ ] **File: `/src/react-app/components/inventory/InventoryTable.tsx`**
  - [ ] Table component for displaying inventory items with sorting and filtering
  - [ ] Include columns for name, category, quantity, location, etc.

- [ ] **File: `/src/react-app/components/inventory/InventoryDetail.tsx`**
  - [ ] Component for displaying detailed inventory item information
  - [ ] Display all available information about the inventory item

### 3. Create Page Components

- [x] **File: `/src/react-app/pages/Recipes/index.tsx`**
  - [x] Main recipes page showing a grid/list of recipe cards
  - [x] Include search functionality
  - [x] Add loading states for when recipes are being fetched
  - [x] Add error handling

- [x] **File: `/src/react-app/pages/Recipes/RecipeDetail.tsx`**
  - [x] Individual recipe detail page
  - [x] Display the complete recipe information including ingredients
  - [x] Add loading and error states

- [ ] **File: `/src/react-app/pages/Inventory/index.tsx`**
  - [ ] Main inventory page showing a table of inventory items
  - [ ] Include search, filter, and sort functionality
  - [ ] Add loading state for when inventory items are being fetched

- [ ] **File: `/src/react-app/pages/Inventory/InventoryDetail.tsx`**
  - [ ] Individual inventory item detail page
  - [ ] Display all information about the inventory item
  - [ ] Add loading and error states

### 4. Update Router Configuration

- [x] **File: `/src/react-app/router/config.ts`**
  - [x] Add new routes for recipes pages
  - [x] Set up route parameters for detail views
  - [ ] Add routes for inventory pages

### 5. Update Home Page

- [x] **File: `/src/react-app/pages/Home/index.tsx`**
  - [x] Update the home page to include navigation cards for Recipes and Inventory
  - [x] Add a brief overview of the application's functionality

### 6. Implement State Management

- [x] **Create a modular data context system**
  - [x] **File: `/src/react-app/context/AppDataContext.tsx`**
    - [x] Create a context for managing application state
    - [x] Set up provider component
  
  - [x] **File: `/src/react-app/context/recipes/recipesState.ts`**
    - [x] Implement recipe state management
    - [x] Include loading, error, and data states
    - [x] Implement functions for fetching and caching recipes

  - [ ] **File: `/src/react-app/context/inventory/inventoryState.ts`**
    - [ ] Implement inventory state management
    - [ ] Include loading, error, and data states
    - [ ] Implement functions for fetching and caching inventory items

### 7. Implement Hooks

- [x] **File: `/src/react-app/hooks/useRecipes.ts`**
  - [x] Create a hook for accessing recipe data and functions
  - [x] Include functions for fetching all recipes and individual recipes

- [ ] **File: `/src/react-app/hooks/useInventory.ts`**
  - [ ] Create a hook for accessing inventory data and functions
  - [ ] Include functions for fetching all inventory items and individual items

### 8. Update App Component

- [x] **File: `/src/react-app/App.tsx`**
  - [x] Wrap the application with the AppDataProvider
  - [x] Update the layout to include the navigation component

## Implementation Progress

### Phase 1: Foundation (Completed)
1. [x] Create API service files
2. [x] Create shared UI components
3. [x] Update router configuration
4. [x] Implement context providers

### Phase 2: Recipe Pages (Completed)
1. [x] Create recipe-specific components
2. [x] Implement the recipes list page
3. [x] Implement the recipe detail page
4. [x] Connect to the API

### Phase 3: Inventory Pages (In Progress)
1. [ ] Create inventory-specific components
2. [ ] Implement the inventory list page
3. [ ] Implement the inventory detail page
4. [ ] Connect to the API

### Phase 4: Polish and Testing (In Progress)
1. [x] Add loading and error states
2. [x] Implement search functionality
3. [ ] Test the application with real data
4. [x] Add responsive design adjustments

## Design Guidelines

1. [x] Use consistent spacing and typography
2. [x] Implement responsive design for all pages
3. [x] Use ShadcnUI components for UI consistency
4. [x] Implement error states and loading indicators
5. [ ] Ensure accessibility compliance

## Future Enhancements

1. [ ] Implement create, update, and delete functionality for recipes and inventory items
2. [ ] Add authentication for protected routes
3. [ ] Implement shopping list management
4. [ ] Add recipe ingredient to shopping list functionality
5. [ ] Implement real-time inventory tracking
6. [ ] Add data visualization for inventory usage