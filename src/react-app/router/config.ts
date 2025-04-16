import HomePage from '@pages/Home';
import RecipesPage from '@pages/Recipes';
import RecipeDetailPage from '@pages/Recipes/RecipeDetail';
import InventoryPage from '@pages/Inventory';
import InventoryDetailPage from '@pages/Inventory/InventoryDetail';
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
];

export default routes;