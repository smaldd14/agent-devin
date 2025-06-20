import HomePage from '@pages/Home';
import RecipesPage from '@pages/Recipes';
import ImportRecipePage from '@pages/Recipes/Import';
import RecipeDetailPage from '@pages/Recipes/RecipeDetail';
import InventoryPage from '@pages/Inventory';
import InventoryDetailPage from '@pages/Inventory/InventoryDetail';
import SwipePage from '@pages/Swipe';
import GenerateRecipesPage from '@pages/GenerateRecipes';
import MealPlanPage from '@pages/MealPlan';
import ShoppingListsPage from '@pages/ShoppingLists';
import ShoppingListDetailPage from '@pages/ShoppingLists/ShoppingListDetail';
import { ComponentType } from 'react';

export type RouteType = {
  path?: string;
  key: string;
  component: ComponentType<object>; 
  children?: RouteType[];
  index?: boolean;
  props?: Record<string, object>;
};

export type RoutesConfig = RouteType[];

const routes: RoutesConfig = [
  {
    path: "/",
    key: "Root",
    component: HomePage,
    index: true,
  },
  {
    path: "/recipes",
    key: "Recipes",
    component: RecipesPage,
  },
  {
    path: "/recipes/import",
    key: "ImportRecipe",
    component: ImportRecipePage,
  },
  {
    path: "/recipes/generate",
    key: "GenerateRecipes",
    component: GenerateRecipesPage,
  },
  {
    path: "/recipes/:id",
    key: "RecipeDetail",
    component: RecipeDetailPage,
  },
  {
    path: "/inventory",
    key: "Inventory",
    component: InventoryPage,
  },
  {
    path: "/inventory/:id",
    key: "InventoryDetail",
    component: InventoryDetailPage,
  },
  {
    path: "/explore",
    key: "Swipe",
    component: SwipePage,
  },
  {
    path: "/plan",
    key: "MealPlan",
    component: MealPlanPage,
  },
  {
    path: "/shopping-lists",
    key: "ShoppingLists",
    component: ShoppingListsPage,
  },
  {
    path: "/shopping-lists/:id",
    key: "ShoppingListDetail",
    component: ShoppingListDetailPage,
  },
];

export default routes;