import { useCallback, useEffect, useState } from 'react';

export function useNavigation() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home');
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash.slice(1) || 'home');
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus());
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const go = useCallback((next: string) => {
    window.location.hash = next;
  }, []);
  return { route, go };
}
