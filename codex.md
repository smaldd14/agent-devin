# Project Codex

This repository implements a full-stack application deployed to Cloudflare Workers, featuring:
- A React + TypeScript front-end built with Vite
- A Hono API backend running on Cloudflare Workers
- When implementing new features, prefer using cloudflare products that already exist such as:
  - Durable Objects
  - KV
  - D1 (SQLite)
  - R2
  - Browser Rendering
- Always prefer modular and reusable code, unless the implementation is simple.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Key Technologies](#key-technologies)
4. [Local Development](#local-development)
5. [Building & Deployment](#building--deployment)
6. [Environment & Configuration](#environment--configuration)
7. [API Routes](#api-routes)
8. [Database Migrations](#database-migrations)
9. [Database Schema](#database-schema)
10. [Troubleshooting & Tips](#troubleshooting--tips)

---

## Architecture Overview

- **Front-end (Client):** A React SPA authored in TypeScript, built and served via Vite.
- **Back-end (API):** A Hono application handling HTTP routes and business logic, packaged as a Cloudflare Worker.
- **Deployment:** Static assets and Worker code are output to `dist/`; Cloudflare Wrangler manages publishing.

The front-end communicates with the Hono API using REST endpoints under a shared subdomain or URL prefix.

## Directory Structure

```
├── public/                # Static files (served by Vite in dev, copied to dist/client)
├── src/
│   ├── react-app/         # React/Vite application
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API wrappers (ky)
│   │   ├── context/, hooks/ # React context and custom hooks
│   │   └── main.tsx        # Entrypoint
│   ├── types/             # Shared TypeScript types
│   └── worker/            # Hono routes and Worker bootstrap
│       ├── routes/        # API route handlers
│       └── index.ts       # Worker entry
├── migrations/            # SQL schema / migrations
├── dist/                  # Compiled client + Worker artifacts
├── wrangler.json          # Cloudflare Worker config
├── vite.config.ts         # Vite config (client build)
├── tsconfig.*.json        # TypeScript configs
└── package.json           # Scripts & dependencies
```

## Key Technologies
- **React** + **TypeScript** + **Vite** + **Shadcn/UI** for front-end
- **Hono** framework on Cloudflare Workers for backend
- **Ky** HTTP client in the UI
- **TailwindCSS** (via `cn` util) for styling
- **Wrangler** (via `wrangler.json`) to manage Worker deployment

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the front-end development server:
   ```bash
   npm run dev:client
   ```
   Vite will serve at http://localhost:5173 by default.
3. Ensure `VITE_API_BASE_URL` in `.env` (or Vite env) points to the Worker endpoint.

## Building & Deployment

1. Build both client and worker:
   ```bash
   npm run build
   ```
   - Outputs static site to `dist/client`
   - Outputs Worker bundle to `dist/agent_devin` (or named Worker)
2. Deploy with Wrangler:
   ```bash
   npx wrangler publish dist/agent_devin --name your-worker-name
   ```
   or simply:
   ```bash
   npm run deploy
   ```

## Environment & Configuration

- `wrangler.json`: Worker bindings (e.g., KV namespaces, secrets)
- Vite env variables in `vite.config.ts`: use `VITE_` prefix for client
- Secrets (e.g., API keys) should be added via Wrangler:
  ```bash
  npx wrangler secret put SECRET_NAME
  ```

## API Routes

- **Health Check**  
  - GET `/api` - Returns `{ name, version, status }`  

- **Recipes** (`/api/recipes`)  
  - GET `/api/recipes` - List all recipes (no ingredients)  
  - GET `/api/recipes/:id` - Get recipe details with ingredients  
  - POST `/api/recipes` - Create a recipe (body: `createRecipeSchema`)  
  - POST `/api/recipes/generate` - Generate recipes via AI (body: `generateRecipeSchema`)  

- **Inventory** (`/api/inventory`)  
  - GET `/api/inventory` - List all inventory items  
  - GET `/api/inventory/:id` - Get single inventory item  
  - POST `/api/inventory` - Create an item (body: `createItemSchema`)  
  - POST `/api/inventory/batch` - Batch create items (body: `batchCreateItemsSchema`)  
  - PUT `/api/inventory/:id` - Update an item (partial fields)  

- **Shopping Lists** (`/api/shopping-lists`)  
  - GET `/api/shopping-lists` - List shopping lists with items  
  - GET `/api/shopping-lists/:id` - Get a specific shopping list with items  
  - POST `/api/shopping-lists` - Create a list (body: `createListSchema`)  
  - POST `/api/shopping-lists/:id/items` - Add item to list (body: `addListItemSchema`)  

## Database Migrations

- The `migrations/schema.sql` contains SQL statements for initializing or updating your schema.
- Apply via your database client or migration tool of choice.

## Database Schema

Below is a summary of the D1 (SQLite) tables defined in `migrations/schema.sql`:

- **recipes**
  - id (INTEGER PK)
  - name TEXT NOT NULL
  - instructions TEXT NOT NULL
  - cooking_time INTEGER
  - difficulty TEXT
  - created_at TIMESTAMP
  - updated_at TIMESTAMP
- **recipe_ingredients**
  - id (INTEGER PK)
  - recipe_id INTEGER (FK ➞ recipes.id)
  - ingredient_name TEXT NOT NULL
  - quantity REAL NOT NULL
  - unit TEXT NOT NULL
  - is_protein INTEGER
  - created_at TIMESTAMP
- **inventory_items**
  - id (INTEGER PK)
  - item_name TEXT NOT NULL
  - category TEXT NOT NULL
  - subcategory TEXT
  - item_description TEXT
  - brand TEXT
  - storage_location TEXT NOT NULL
  - quantity REAL NOT NULL
  - unit TEXT NOT NULL
  - minimum_quantity REAL
  - expiry_date TIMESTAMP
  - purchase_date TIMESTAMP NOT NULL
  - unit_price REAL
  - notes TEXT
  - restock_flag INTEGER DEFAULT 0
  - created_at TIMESTAMP
  - updated_at TIMESTAMP
- **inventory_history**
  - id (INTEGER PK)
  - item_id INTEGER (FK ➞ inventory_items.id)
  - change_type TEXT NOT NULL
  - quantity_change REAL NOT NULL
  - previous_quantity REAL NOT NULL
  - new_quantity REAL NOT NULL
  - change_timestamp TIMESTAMP
  - change_source TEXT NOT NULL
- **shopping_lists**
  - id (INTEGER PK)
  - amazon_link TEXT
  - created_at TIMESTAMP
  - updated_at TIMESTAMP
- **shopping_list_items**
  - id (INTEGER PK)
  - shopping_list_id INTEGER (FK ➞ shopping_lists.id)
  - item_name TEXT NOT NULL
  - quantity REAL
  - unit TEXT
  - category TEXT
  - created_at TIMESTAMP

**Triggers**:
- `update_recipes_updated_at`
- `update_inventory_items_updated_at`
- `update_shopping_lists_updated_at`

## Troubleshooting & Tips

## Troubleshooting & Tips
- If assets fail to load, verify `base` in `vite.config.ts` and `prefixUrl` in `api.ts`.
- Use `npx wrangler tail` for real-time Worker logs.
- For CORS issues: ensure Hono routes set appropriate headers.
- Leverage Miniflare’s KV and D1 stubs during local dev with `--kv` or `--d1` flags.

---

*This file was generated to provide a quick reference for developers onboarding this project.*