import { useEffect, useState } from 'react';

/**
 * Delays updating the returned value until the input has stopped
 * changing for `delayMs`. Used on the search box so we don't fire an
 * API request on every keystroke - only once the user pauses typing.
 */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
