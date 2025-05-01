// src/react-app/pages/Recipes/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/react-app/components/layout/PageHeader';
import { RecipeCard } from '@/react-app/components/recipes/RecipeCard';
import { useRecipes } from '@/react-app/hooks/useRecipes';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Skeleton } from '@/react-app/components/ui/skeleton';
import { PlusCircle, RefreshCw, Search, BookOpen } from 'lucide-react';

export default function RecipesPage() {
  const { recipes, isLoading, error, refetch } = useRecipes();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeletons for recipe cards
  const LoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col h-full space-y-3">
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Recipes"
        description="Browse all your recipes or search for something specific."
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => navigate('/recipes/generate')}>
          <BookOpen className="h-4 w-4 mr-2" />
          Generate Recipes
        </Button>
        <Button size="sm" onClick={() => navigate('/recipes/import')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Import Recipe
        </Button>
      </PageHeader>

      <div className="my-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search recipes..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSkeletons />}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No recipes found matching your search.' : 'No recipes found. Create your first recipe!'}
          </p>
        </div>
      )}

      {!isLoading && !error && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}