// src/react-app/pages/MealPlan/index.tsx
import { useState, useMemo } from 'react';
import { useMealPlan } from '@hooks/useMealPlan';
import { useRecipes } from '@hooks/useRecipes';
// Using built-in date formatting instead of date-fns
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card } from '@components/ui/card';
import { PageHeader } from '@components/layout/PageHeader';
import { AggregatedShoppingListDrawer } from '@components/AggregatedShoppingListDrawer';
import { fetchApi } from '@services/api';
import type { ShoppingListItem } from '@/types/shopping-list';

// Compute start of week (Monday) for given date
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export default function MealPlanPage() {
  // Get this week's Monday start
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getWeekStart(today), [today]);
  const startDate = useMemo(() => weekStart.toISOString().slice(0, 10), [weekStart]);

  // Hook for meal plan data
  const { items, loading, error, updateItem, savePlan } = useMealPlan(startDate);
  // State for aggregated shopping list
  const [aggItems, setAggItems] = useState<ShoppingListItem[]>([]);
  const [aggLoading, setAggLoading] = useState(false);
  const [aggDrawerOpen, setAggDrawerOpen] = useState(false);
  // All recipes for selection
  const { recipes } = useRecipes();

  // Dates for 7-day grid
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      return dateStr;
    });
  }, [weekStart]);

  // State for recipe picker sheet
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Filtered recipes by search
  const filteredRecipes = useMemo(() => {
    if (!search) return recipes || [];
    return recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [recipes, search]);

  // Find recipe id for a date
  const getRecipeForDate = (date: string) => items.find((i) => i.planDate === date)?.recipeId;

  /**
   * Generate aggregated shopping list across all planned recipes.
   */
  const handleGenerateList = async () => {
    if (items.length === 0) return;
    setAggLoading(true);
    try {
      // Batch API call for all planned recipes
      const response = await fetchApi<{ items: ShoppingListItem[] }>(
        '/shopping-lists/generate',
        {
          method: 'POST',
          body: JSON.stringify({ recipeIds: items.map((i) => i.recipeId) }),
        }
      );
      if (response.success && response.data) {
        setAggItems(response.data.items);
        setAggDrawerOpen(true);
      } else {
        throw new Error(response.error || 'Failed to generate shopping list');
      }
    } catch (err) {
      console.error('Error generating shopping list:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate shopping list');
    } finally {
      setAggLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      {/* Page header with Save button on desktop */}
      <PageHeader title="Weekly Meal Plan">
        <div className="hidden md:flex space-x-2">
          <Button variant="secondary" onClick={handleGenerateList} disabled={items.length === 0 || aggLoading}>
            {aggLoading ? 'Generating...' : 'Generate Shopping List'}
          </Button>
          <Button onClick={savePlan} disabled={loading}>
            Save Plan
          </Button>
        </div>
      </PageHeader>
      {loading && <p>Loading plan...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {days.map((date) => {
            const recipeId = getRecipeForDate(date);
            const recipe = recipes.find((r) => r.id === recipeId);
            // Format day name, e.g., Mon, Tue
            const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <Card
                key={date}
                className="p-4 flex flex-col justify-between h-48 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedDate(date); setPickerOpen(true); }}
              >
                <div>
                  <p className="text-sm font-medium">{dayName}</p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
                {recipe ? (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{recipe.name}</p>
                    {recipe.url && (
                      <a
                        href={recipe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary truncate block"
                      >
                        {new URL(recipe.url).hostname}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>No meal</p>
                  </div>
                )}
                {/* Click card to add/change recipe */}
              </Card>
            );
          })}
          </div>
          {/* Sticky action bar on mobile */}
          <div className="fixed bottom-0 left-0 w-full bg-background border-t p-4 flex flex-col space-y-2 md:hidden">
            <Button className="w-full" variant="secondary" onClick={handleGenerateList} disabled={aggLoading || items.length === 0}>
              {aggLoading ? 'Generating...' : 'Generate Shopping List'}
            </Button>
            <Button className="w-full" onClick={savePlan} disabled={loading}>
              Save Plan
            </Button>
          </div>
        </>
      )}

      {/* Recipe Picker Sheet */}
      <Sheet open={pickerOpen} onOpenChange={(v) => !v && setPickerOpen(false)}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>
              Select Recipe for {selectedDate}
            </SheetTitle>
            <SheetDescription>
              Search and choose a recipe
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Input
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2 overflow-y-auto max-h-60">
              {filteredRecipes.map((r) => (
                <Button
                  key={r.id}
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={() => {
                    if (selectedDate) updateItem(selectedDate, r.id);
                    setPickerOpen(false);
                    setSearch('');
                  }}
                >
                  {r.name}
                </Button>
              ))}
            </div>
          </div>
          <SheetFooter>
            <div className="flex justify-end">
              <SheetClose asChild>
                <Button variant="outline">
                  Close
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {/* Aggregated shopping list drawer */}
      <AggregatedShoppingListDrawer
        isOpen={aggDrawerOpen}
        onClose={() => setAggDrawerOpen(false)}
        initialItems={aggItems}
      />
    </div>
  );
}