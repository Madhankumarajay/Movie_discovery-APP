import { useEffect, useRef } from 'react';

/**
 * Fires `onIntersect` when the returned ref's element scrolls into view.
 * Used to load the next page of results as the user nears the bottom of
 * the grid, instead of a "Load more" click or - worse - fetching every
 * page up front. Keeps the DOM and network usage proportional to how
 * far the user has actually scrolled, which is how we handle "large
 * result sets" without the page getting slower over time.
 */
export function useInfiniteScroll({ onIntersect, enabled = true }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
