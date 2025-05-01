import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createRecipeSchema } from '../controllers/recipes';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe
} from '../controllers/recipes';
import {
  generateRecipeSchema,
  generateRecipe
} from '../controllers/recipe-generator';
import { scrapeRecipeSchema, scrapeRecipe } from '../controllers/recipes-scrape';
import { AppType } from '../index';

const routes = new Hono<AppType>();

routes.get('/', getAllRecipes);
routes.get('/:id', getRecipeById);
routes.post('/', zValidator('json', createRecipeSchema), createRecipe);
// AI-powered recipe generation
routes.post(
  '/generate',
  zValidator('json', generateRecipeSchema),
  generateRecipe
);
// Recipe scraping via Browser Rendering
routes.post(
  '/scrape',
  zValidator('json', scrapeRecipeSchema),
  scrapeRecipe
);

export const recipeRoutes = routes;