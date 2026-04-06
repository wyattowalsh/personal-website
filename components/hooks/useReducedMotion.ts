import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void) {
  const mq = window.matchMedia(query);
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', callback);
    return () => mq.removeEventListener('change', callback);
  }

  mq.addListener(callback);
  return () => mq.removeListener(callback);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
