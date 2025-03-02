import { useCallback } from 'react';

export function useScrollLock() {
  return useCallback((lock: boolean) => {
    if (lock) {
      document.body.dataset.scrollLock = '';
    } else {
      delete document.body.dataset.scrollLock;
    }
  }, []);
}
