import HomePage from '@pages/Home';
import RecipesPage from '@pages/Recipes';
import RecipeDetailPage from '@pages/Recipes/RecipeDetail';
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
];

export default routes;