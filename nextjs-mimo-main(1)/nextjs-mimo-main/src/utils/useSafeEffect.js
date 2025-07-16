import { useEffect, useRef } from 'react';

export function useSafeEffect(effect, deps = []) {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let effectCleanup;
    
    const executeEffect = async () => {
      try {
        effectCleanup = await effect(isMounted);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in useSafeEffect:', error);
        }
      }
    };

    executeEffect();

    return () => {
      if (typeof effectCleanup === 'function') {
        effectCleanup();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return isMounted;
}
