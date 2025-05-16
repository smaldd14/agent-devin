import { Hono } from 'hono';
import type { BrowserWorker } from '@cloudflare/puppeteer';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler';
import { setupRoutes } from './routes';

// Define the environment interface
// Define the Worker environment bindings
interface Env {
  DB: D1Database;
  // API key for AI LLM
  OPENAI_API_KEY: string;
  // Browser Rendering service binding
  BROWSER: BrowserWorker;
  // KV namespace for caching scraped recipe data and session queues
  RECIPE_SWIPE_CACHE: KVNamespace;
  // API key for Brave Search
  BRAVE_API_KEY: string;
}

// Create a new Hono app with proper typing
export type AppType = {
  Bindings: Env;
  Variables: {
    json: any;  // Required for zValidator
  };
};

const app = new Hono<AppType>();

// Add global middleware
app.use('*', cors());
app.use('*', errorHandler());

// Setup all routes
setupRoutes(app);

// Health check route
app.get('/api', (c) => {
  return c.json({
    name: 'agent-devin-api',
    version: '1.0.0',
    status: 'healthy'
  });
});

export default app;