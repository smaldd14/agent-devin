// src/react-app/pages/Recipes/RecipeDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRecipe } from '@/react-app/hooks/useRecipes';
import { RecipeDetail } from '@/react-app/components/recipes/RecipeDetail';
import { PageHeader } from '@/react-app/components/layout/PageHeader';
import { Button } from '@/react-app/components/ui/button';
import { Skeleton } from '@/react-app/components/ui/skeleton';
import { Badge } from '@/react-app/components/ui/badge';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? parseInt(id, 10) : null;
  const { recipe, isLoading, error, refetch } = useRecipe(recipeId);

  // Loading skeleton for recipe detail
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/recipes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Link>
        </Button>
      </div>

      {isLoading && <LoadingSkeleton />}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && !recipe && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recipe not found.</p>
          <Button asChild className="mt-4">
            <Link to="/recipes">View All Recipes</Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && recipe && (
        <>
          <PageHeader 
            title={recipe.name}
            description={
              <>
                Created: {new Date(recipe.created_at).toLocaleDateString()}
                {recipe.difficulty && (
                  <Badge variant="secondary" className="ml-2">
                    {recipe.difficulty}
                  </Badge>
                )}
              </>
            }
          />
          <RecipeDetail recipe={recipe} />
        </>
      )}
    </div>
  );
}