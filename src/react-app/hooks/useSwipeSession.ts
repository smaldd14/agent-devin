// useSwipeSession.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getNextRecipe,
  postSwipeAction,
  undoSwipe,
} from '../services/swipe';
import { SwipeRecipeCard } from '@/types/api';

/**
 * Hook to manage swipe session state: current card, next card prefetch,
 * and swipe actions (like/skip).
 */
export function useSwipeSession(
  sessionId?: string
) {
  const [current, setCurrent] = useState<SwipeRecipeCard | null>(null);
  const [next, setNext] = useState<SwipeRecipeCard | null>(null);
  const [loading, setLoading] = useState(false);
  // Track remaining cards in session
  const [remaining, setRemaining] = useState(0);
  // Track if we just performed an undo
  const [justUndid, setJustUndid] = useState(false);

  // Fetch a card from the API using sessionId
  const loadNext = useCallback(async (): Promise<SwipeRecipeCard | null> => {
    if (!sessionId) return null;
    const res = await getNextRecipe(sessionId);
    if (!res.success) {
      console.error('Failed to fetch next recipe:', res.error);
      return null;
    }
    // update remaining count if provided
    if (typeof res.remaining === 'number') {
      setRemaining(res.remaining);
    }
    return res.data ?? null;
  }, [sessionId]);

  // Initialize current and next cards when sessionId becomes available
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    async function init() {
      setLoading(true);
      const first = await loadNext();
      if (cancelled) return;
      setCurrent(first);
      if (first && first.image) {
        const img = new Image(); img.src = first.image;
      }
      const second = await loadNext();
      if (cancelled) return;
      setNext(second);
      if (second && second.image) {
        const img = new Image(); img.src = second.image;
      }
      setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [sessionId, loadNext]);

  // Reset justUndid flag after 500ms
  useEffect(() => {
    if (justUndid) {
      const timer = setTimeout(() => setJustUndid(false), 500);
      return () => clearTimeout(timer);
    }
  }, [justUndid]);

  // Perform a swipe action and advance cards
  const swipe = useCallback(
    async (action: 'like' | 'skip') => {
      if (!sessionId || !current) return;
      // Record action in backend with sessionId
      await postSwipeAction(sessionId, current.recipeId, action);
      // Reset undo flag when swiping
      setJustUndid(false);
      // Advance cards
      setCurrent(next);
      if (next && next.image) {
        const img = new Image(); img.src = next.image;
      }
      const nextCard = await loadNext();
      setNext(nextCard);
    },
    [sessionId, current, next, loadNext]
  );
  
  // Undo last swipe: restores last card as current
  const undo = useCallback(async () => {
    if (!sessionId) return;
    const res = await undoSwipe(sessionId);
    if (!res.success || !res.data) {
      console.error('Failed to undo swipe:', res.error);
      return;
    }
    const { card, remaining: newRem } = res.data;
    // Set the undid flag to trigger special animation
    setJustUndid(true);
    // Update current card
    setCurrent({
      recipeId: card.recipeId,
      name: card.name,
      image: card.image,
      cookTime: card.prepTime || '',
      difficulty: card.difficulty || '',
      externalUrl: card.externalUrl,
    });
    // Update remaining count
    console.log('Remaining after undo:', newRem);
    setRemaining(newRem);
    // Note: next remains unchanged
  }, [sessionId]);

  return { current, next, loading, remaining, swipe, undo, justUndid };
}