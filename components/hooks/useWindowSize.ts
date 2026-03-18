import { useState, useEffect, useRef } from 'react';

const DEBOUNCE_MS = 300;

export const useWindowSize = () => {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (timerId.current !== null) {
        clearTimeout(timerId.current);
      }

      timerId.current = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        timerId.current = null;
      }, DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerId.current !== null) {
        clearTimeout(timerId.current);
      }
    };
  }, []);

  return size;
};
