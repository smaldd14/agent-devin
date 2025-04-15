// src/react-app/components/recipes/RecipeDetail.tsx
import { Clock, ChefHat } from 'lucide-react';
import { Recipe } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/react-app/components/ui/card';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  // Split instructions into paragraphs for better readability
  const instructionParagraphs = recipe.instructions.split('\n').filter(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{recipe.name}</CardTitle>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            {recipe.cooking_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.cooking_time} minutes</span>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                <span>{recipe.difficulty} difficulty</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium mb-2">Instructions</h3>
          <div className="space-y-4">
            {instructionParagraphs.map((paragraph, index) => (
              <p key={index} className="text-sm">{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="text-sm flex justify-between">
                  <span className={ingredient.is_protein ? "font-medium" : ""}>
                    {ingredient.ingredient_name}
                  </span>
                  <span className="text-muted-foreground">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}