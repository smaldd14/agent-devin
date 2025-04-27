import { useState } from 'react';
import { PageHeader } from '@/react-app/components/layout/PageHeader';
import { Input } from '@/react-app/components/ui/input';
import { Button } from '@/react-app/components/ui/button';
import { generateRecipes, GenerateRecipesRequest } from '@/react-app/services/recipes';
import type { GenerateRecipesResponse } from '@/types/api';

export default function GenerateRecipesPage() {
  const [max, setMax] = useState<number>(3);
  const [cuisine, setCuisine] = useState<string>('');
  const [dietary, setDietary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenerateRecipesResponse | null>(null);

  const onSubmit = async () => {
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const payload: GenerateRecipesRequest = {
        max_recipes: max,
        preferences: {
          ...(cuisine ? { cuisine } : {}),
          ...(dietary ? { dietary } : {}),
        },
      };
      const res = await generateRecipes(payload);
      if (!res.success) throw new Error(res.error || 'Unknown error');
      setData(res.data || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader title="Generate Recipes" description="Create recipe ideas based on your pantry inventory." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Max Recipes</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={max}
            onChange={e => setMax(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Cuisine</label>
          <Input
            placeholder="e.g., Italian"
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Dietary</label>
          <Input
            placeholder="e.g., vegan"
            value={dietary}
            onChange={e => setDietary(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={loading} className="mb-6">
        {loading ? 'Generating…' : 'Generate Recipes'}
      </Button>
      {error && <div className="text-destructive mb-4">{error}</div>}
      {data && (
        <div className="space-y-8">
          {data.recipes.map((recipe, idx) => (
            <div key={idx} className="p-4 border rounded-md">
              <h2 className="text-xl font-semibold">{recipe.name}</h2>
              <p className="text-sm text-muted-foreground">
                {recipe.cooking_time} min • {recipe.difficulty}
              </p>
              <div className="mt-2">
                <strong>Ingredients:</strong>
                <ul className="list-disc ml-5">
                  {recipe.ingredients.map((ing, j) => (
                    <li key={j}>
                      {ing.ingredient_name} — {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <strong>Instructions:</strong>
                <p>{recipe.instructions}</p>
              </div>
            </div>
          ))}
          {data.shopping_list.length > 0 && (
            <div className="p-4 border rounded-md">
              <h2 className="text-lg font-semibold">Shopping List</h2>
              <ul className="list-disc ml-5">
                {data.shopping_list.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}