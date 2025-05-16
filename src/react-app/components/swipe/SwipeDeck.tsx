// SwipeDeck.tsx
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import type { SwipeRecipeCard } from '@/types/api';

interface SwipeDeckProps {
  current: SwipeRecipeCard | null;
  next: SwipeRecipeCard | null;
  remaining: number;
  onSwipe: (action: 'like' | 'skip') => void;
  justUndid?: boolean; // Add this prop to detect when undo was just used
}

export default function SwipeDeck({ 
  current, 
  next, 
  remaining, 
  onSwipe,
  justUndid = false 
}: SwipeDeckProps) {
  // Call all hooks at the top level of your component
  const x = useMotionValue(0);
  const prevCardRef = useRef<string | null>(null);
  
  // Reset drag offset whenever the current card changes
  useEffect(() => {
    if (current?.recipeId) {
      // Animation when a card returns from undo
      if (justUndid && prevCardRef.current !== current.recipeId) {
        // Start from left side when coming from undo
        x.set(-300);
        // Animate back to center
        setTimeout(() => {
          x.set(0);
        }, 50);
      } else {
        // Normal case (not undo)
        x.set(0);
      }
      prevCardRef.current = current.recipeId;
    }
  }, [current?.recipeId, justUndid]);
  
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const skipOpacity = useTransform(x, [-150, -50], [1, 0]);
  const cardOpacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const cardScale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  
  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const offset = info.offset.x;
    if (offset > 100) {
      onSwipe('like');
    } else if (offset < -100) {
      onSwipe('skip');
    }
  };

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto h-[460px] md:h-[520px]">
      {/* Card counter badge */}
      <div className="absolute top-4 right-4 z-30 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
        {remaining} left
      </div>

      {/* Like/Skip indicators */}
      <motion.div
        className="absolute left-8 top-1/3 z-20 transform -translate-y-1/2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg rotate-[-15deg]"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      <motion.div
        className="absolute right-8 top-1/3 z-20 transform -translate-y-1/2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg rotate-[15deg]"
        style={{ opacity: skipOpacity }}
      >
        SKIP
      </motion.div>

      {/* Next card (behind current) */}
      {next && (
        <div className="absolute inset-2 top-4 z-10">
          <motion.div
            className="w-full h-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <SwipeCard recipe={next} />
          </motion.div>
        </div>
      )}

      {/* Current card (swipeable) */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.recipeId}
            className="absolute inset-0 z-20"
            style={{ 
              x, 
              rotate, 
              opacity: cardOpacity,
              scale: cardScale
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={justUndid ? { x: -300, opacity: 0.5 } : { x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: x.get() < 0 ? -300 : 300,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <SwipeCard recipe={current} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when no cards */}
      {!current && !next && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800/30 backdrop-blur-sm">
          <div className="text-center p-4 bg-gray-900/90 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-2">No more recipes</h3>
            <p className="text-gray-300 mb-4">You've gone through all available recipes.</p>
          </div>
        </div>
      )}
    </div>
  );
}