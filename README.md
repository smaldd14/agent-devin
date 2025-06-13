# 🍳 Agent Devin - AI-Powered Recipe & Meal Planning Platform

An intelligent full-stack application that revolutionizes meal planning and grocery shopping through AI-powered recipe discovery, inventory management, and automated shopping list generation.

![Built with React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![Powered by Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)
![Hono Framework](https://img.shields.io/badge/Hono-4.7.5-yellow?logo=hono)

## ✨ Features

### 🎯 **Recipe Discovery**
- **Swipe Interface**: Tinder-style recipe discovery with personalized recommendations
- **AI Recipe Generation**: Create custom recipes based on your pantry inventory and dietary preferences
- **Smart Scraping**: Automated recipe extraction from popular cooking websites using JSON-LD and browser rendering
- **Advanced Filters**: Dietary restrictions, cuisine types, cooking time, and difficulty levels

### 📋 **Meal Planning**
- **Weekly Planner**: Interactive calendar-style meal planning for the entire week
- **Recipe Assignment**: Drag-and-drop interface to assign recipes to specific days
- **Flexible Planning**: Leave days blank or assign multiple recipes per day

### 🛒 **Smart Shopping Lists**
- **AI-Powered Generation**: Automatically generate shopping lists from recipes using OpenAI
- **Inventory Integration**: Compares recipe ingredients against your current pantry inventory
- **Amazon Fresh Integration**: One-click export to Amazon Fresh with optimized formatting
- **Quantity Aggregation**: Automatically combines duplicate items across multiple recipes

### 📦 **Inventory Management**
- **Comprehensive Tracking**: Track pantry items with quantities, expiration dates, and storage locations
- **Smart Categories**: Organized by food categories and subcategories
- **Low Stock Alerts**: Automatic restock flagging based on minimum quantity thresholds
- **Purchase History**: Track spending and purchase patterns

## 🏗️ Architecture

**Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Shadcn/UI  
**Backend**: Hono framework on Cloudflare Workers  
**Database**: Cloudflare D1 (SQLite)  
**Storage**: Cloudflare KV for caching  
**AI**: OpenAI GPT-4 for recipe generation and shopping list optimization  
**Scraping**: Cloudflare Browser Rendering + Puppeteer  

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account with Workers access
- OpenAI API key

### 1. Clone and Install
```bash
git clone https://github.com/smaldd14/agent-devin.git
cd agent-devin
npm install
```

### 2. Environment Setup
```bash
# Set up your OpenAI API key
npm run secret OPENAI_API_KEY
# Follow the prompt to enter your API key
```

### 3. Database Setup
Apply the database schema to your Cloudflare D1 database:
```bash
# Create your D1 database in Cloudflare Dashboard first
# Then apply migrations
wrangler d1 execute agent-devin --file=./migrations/schema.sql
```

### 4. Configure Bindings
Update `wrangler.json` with your database and KV namespace IDs:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "agent-devin",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "RECIPE_SWIPE_CACHE",
      "id": "YOUR_KV_NAMESPACE_ID_HERE"
    }
  ]
}
```

### 5. Development
```bash
# Start the React development server
npm run dev

# In a separate terminal, start the Worker (for scraping features)
npm run dev:worker
```

Visit `http://localhost:5173` to see the application in action!

## 📱 Usage Guide

### Recipe Discovery
1. Navigate to `/swipe` to start discovering recipes
2. Set your dietary preferences and cuisine filters
3. Swipe right to save recipes, left to skip
4. Access saved recipes in your recipe collection

### Meal Planning
1. Go to `/plan` to create your weekly meal plan
2. Click on any day to assign recipes from your collection
3. Generate consolidated shopping lists for the entire week
4. Export directly to Amazon Fresh for convenient ordering

### Inventory Management
1. Visit `/inventory` to manage your pantry
2. Add items with quantities, categories, and expiration dates
3. Set minimum stock levels for automatic restock alerts
4. Track your grocery spending and purchase history

### AI Recipe Generation
1. Access `/generate` to create custom recipes
2. Specify ingredients from your pantry
3. Set dietary preferences and cuisine style
4. Get AI-generated recipes with cooking instructions

## 🛠️ Development

### Project Structure
```
src/
├── react-app/           # React frontend application
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components and routing
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client services
│   └── context/         # React context providers
├── worker/              # Cloudflare Worker backend
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   └── utils/           # Utility functions
└── types/               # Shared TypeScript types
```

### Available Scripts
```bash
npm run dev          # Start React development server
npm run dev:worker   # Start Cloudflare Worker in remote mode
npm run build        # Build for production
npm run deploy       # Build and deploy to Cloudflare
npm run lint         # Run ESLint
npm run types        # Generate Cloudflare Worker types
```

### API Endpoints
- `GET /api/recipes` - List all recipes
- `POST /api/recipes/generate` - AI recipe generation
- `POST /api/recipes/scrape` - Scrape recipe from URL
- `GET /api/swipe/session` - Start recipe discovery session
- `GET /api/swipe/next` - Get next recipe in session
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `GET /api/meal-plans` - Get weekly meal plan
- `POST /api/meal-plans` - Save meal plan
- `POST /api/shopping-lists/generate` - Generate shopping list

## 🧪 Testing

The application includes comprehensive testing for both frontend and backend components:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🔒 Security

- Environment variables for sensitive data (API keys)
- Input validation using Zod schemas
- Error handling with custom error classes
- CORS protection for API endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/) for global edge deployment
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Recipe data powered by [OpenAI GPT-4](https://openai.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Live Demo**: [https://agent-devin.your-subdomain.workers.dev](https://agent-devin.your-subdomain.workers.dev)

Made with ❤️ for food lovers and meal planning enthusiasts