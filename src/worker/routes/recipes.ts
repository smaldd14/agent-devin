import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createRecipeSchema } from '../controllers/recipes';
import { 
  getAllRecipes, 
  getRecipeById, 
  createRecipe 
} from '../controllers/recipes';
import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllRecipes);
routes.get('/:id', getRecipeById);
routes.post('/', zValidator('json', createRecipeSchema), createRecipe);

export const recipeRoutes = routes;