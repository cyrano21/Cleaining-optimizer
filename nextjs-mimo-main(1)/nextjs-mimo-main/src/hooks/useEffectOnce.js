import { useEffect, useRef } from 'react';

export function useEffectOnce(effect) {
  const hasRun = useRef(false);
  const cleanup = useRef(null);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      cleanup.current = effect();
    }

    return () => {
      if (cleanup.current && typeof cleanup.current === 'function') {
        cleanup.current();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tableau de dépendances vide pour s'exécuter une seule fois
}
