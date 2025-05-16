// SwipePage.tsx (index.tsx)
import { useState } from 'react';
import { useSwipeSession } from '@hooks/useSwipeSession';
import SwipeCard from '@components/swipe/SwipeCard'; 
import SwipeCardSkeleton from '@components/swipe/SwipeCardSkeleton'; // Import skeleton loader
import FilterControls from '@components/swipe/FilterControls';
import { Button } from '@components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion';
import { PreferencesFormValues } from '@components/swipe/PreferencesForm';
import { initSwipeSession } from '@services/swipe';
import { Skeleton } from '@components/ui/skeleton';

export default function SwipePage() {
  // Store the active swipe session ID
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PreferencesFormValues>({ dietary: [], cuisine: [], sites: [] });
  const { current, loading, remaining, swipe, undo } = useSwipeSession(sessionId || undefined);

  // Handle starting a new session
  const handleStartSession = (newSessionId: string, newFilters: PreferencesFormValues) => {
    setSessionId(newSessionId);
    setFilters(newFilters);
  };

  // Handle restarting when no more recipes
  const handleFetchMore = async () => {
    try {
      // Initialize a new session with the same filters
      const res = await initSwipeSession(filters);
      if (res.success && res.data) {
        setSessionId(res.data.sessionId);
      } else {
        alert('Failed to start session: ' + res.error);
      }
    } catch (error) {
      console.error('Error fetching more recipes:', error);
      alert('An error occurred while fetching more recipes');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      <div className="w-full max-w-md px-4 pb-6 flex flex-col min-h-screen">
        {/* Title */}
        <div className="py-4 text-center">
          <h1 className="text-2xl font-bold">Recipe Explorer</h1>
          <p className="text-gray-600 text-sm">Swipe to discover new recipes</p>
        </div>

        {/* Session is active - Show filters in accordion */}
        {sessionId && (
          <div className="mb-4 w-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="filters">
                <AccordionTrigger className="text-sm font-medium">
                  Filters & Preferences
                </AccordionTrigger>
                <AccordionContent>
                  <FilterControls onStart={handleStartSession} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Progress indicator when session is active */}
        {sessionId && remaining > 0 && (
          <div className="mb-4 w-full">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span>Recipes Remaining</span>
              <span>{remaining}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min(100, (remaining / (remaining + 10)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* If session not initialized, show full filter form */}
        {!sessionId && (
          <div className="flex-grow flex flex-col justify-center">
            <FilterControls onStart={handleStartSession} />
          </div>
        )}

        {/* Main content area - takes available space */}
        <div className="flex-grow flex flex-col justify-center items-center">
          {/* Loading state */}
          {loading && !current && (
            <div className="w-full flex flex-col items-center justify-center h-96 gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <p className="text-gray-600">Loading recipes...</p>
            </div>
          )}

          {/* Card skeleton loader while loading */}
          {loading && current && (
            <div className="mb-6 w-full h-[60vh] sm:h-auto">
              <SwipeCardSkeleton />
            </div>
          )}

          {/* Card display and action buttons */}
          {!loading && current && (
            <>
              <div className="mb-6 w-full">
                {/* Maximized card height on mobile */}
                <div className="h-[60vh] sm:h-auto w-full">
                  <SwipeCard recipe={current} />
                </div>
              </div>
              <div className="flex justify-center space-x-4 w-full">
                <Button 
                  onClick={() => swipe('skip')} 
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  Skip
                </Button>
                <Button 
                  onClick={() => swipe('like')} 
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  Like
                </Button>
                <Button 
                  onClick={() => undo()} 
                  variant="outline"
                >
                  Undo
                </Button>
              </div>
            </>
          )}

          {/* Empty state - No more recipes */}
          {!loading && sessionId && !current && (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
              <h3 className="text-xl font-medium mb-2">No more recipes</h3>
              <p className="text-gray-600 mb-6">You've gone through all recipes matching your filters</p>
              <div className="flex flex-col space-y-4">
                <Button onClick={handleFetchMore} variant="default">
                  Fetch More Recipes
                </Button>
                <Button 
                  onClick={() => setSessionId(null)} 
                  variant="outline"
                >
                  Change Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}