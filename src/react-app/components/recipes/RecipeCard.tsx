// src/react-app/components/recipes/RecipeCard.tsx
import { Link } from 'react-router-dom';
import { Clock, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '@/types/api';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Truncate instructions for preview
  const truncatedInstructions = recipe.instructions.length > 100
    ? `${recipe.instructions.substring(0, 100)}...`
    : recipe.instructions;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{recipe.name}</CardTitle>
        {recipe.difficulty && (
          <CardDescription>{recipe.difficulty} difficulty</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{truncatedInstructions}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {recipe.cooking_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cooking_time} min</span>
            </div>
          )}
          {!recipe.cooking_time && recipe.difficulty && (
            <div className="flex items-center gap-1">
              <UtensilsCrossed className="h-4 w-4" />
              <span>{recipe.difficulty}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/recipes/${recipe.id}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}