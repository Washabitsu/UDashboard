import { useCallback, useEffect, useState } from 'react';

import { getRequestErrorMessage } from '@/api/errorMessage';

type LoadResult<T> = {
  // What was asked for when this result came back: which function, and which press of "Try again"
  load: () => Promise<T>;
  reloadCount: number;
  data: T | null;
  error: string;
};

// Loads something when the page opens, and again when `load` changes or reload() is called.
// `load` must be wrapped in useCallback, otherwise it is a new function on every render.
export function useLoad<T>(load: () => Promise<T>, errorMessage: string) {
  const [result, setResult] = useState<LoadResult<T> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    load()
      .then((data) => {
        if (isCurrent) {
          setResult({ load, reloadCount, data, error: '' });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setResult((previous) => ({
            load,
            reloadCount,
            // A reload that fails keeps what is already on screen
            data: previous?.load === load ? previous.data : null,
            error: getRequestErrorMessage(error, errorMessage),
          }));
        }
      });

    // A response that arrives after the page has moved on is ignored
    return () => {
      isCurrent = false;
    };
  }, [load, errorMessage, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading: nothing came back yet, or the result is for something else (another id in the address),
  // or "Try again" was pressed after an error. A reload of data that is already shown is not "loading":
  // the old rows stay on screen until the new ones arrive, so a table doesn't flash empty.
  const isLoading =
    result === null ||
    result.load !== load ||
    (result.data === null && result.reloadCount !== reloadCount);

  return {
    data: isLoading ? null : result.data,
    error: isLoading ? '' : result.error,
    isLoading,
    reload,
  };
}
