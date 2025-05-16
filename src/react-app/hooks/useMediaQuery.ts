// useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns true if the media query matches
 * @param query The media query to check
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with a default value to handle SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create the media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQuery.matches);

    // Create a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener and clean up on unmount
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]); // Only re-run if the query changes

  return matches;
}