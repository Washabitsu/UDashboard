import { useState } from 'react';

import { getRequestErrorMessage } from '@/api/errorMessage';

// The state behind a "Delete …?" dialog: which item was picked, whether the request is running,
// and the error if it failed. Used by every list page.
export function useDeleteDialog<T>(remove: (item: T) => Promise<unknown>, onDeleted: () => void) {
  const [item, setItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const ask = (nextItem: T) => {
    setError('');
    setItem(nextItem);
  };

  // While the request runs the dialog stays, so its answer (or its error) is not lost
  const cancel = () => {
    if (!isDeleting) {
      setItem(null);
    }
  };

  const confirm = async () => {
    if (!item) {
      return;
    }

    setIsDeleting(true);
    try {
      await remove(item);
      setItem(null);
      onDeleted();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Could not delete it.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return { item, isDeleting, error, ask, cancel, confirm };
}
