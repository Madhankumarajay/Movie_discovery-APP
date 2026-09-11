import { useEffect, useRef } from 'react';

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
