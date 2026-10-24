import { useCallback, useEffect, useState } from 'react';
import { telegram } from '../platform/telegram';

function launchRoute() {
  const start = new URLSearchParams(telegram()?.initData).get('start_param') ?? new URLSearchParams(window.location.search).get('tgWebAppStartParam');
  return start?.startsWith('feed_') ? `notification/${encodeURIComponent(start.slice(5))}` : undefined;
}

export function useNavigation() {
  const [route, setRoute] = useState(() => {
    const url = new URL(window.location.href);
    const notification = url.searchParams.get('notification');
    const initial = notification ? `notification/${encodeURIComponent(notification)}` : window.location.hash.slice(1) || launchRoute() || 'home';
    if (notification || !window.location.hash) {
      url.searchParams.delete('notification');
      url.hash = initial;
      window.history.replaceState(null, '', url);
    }
    return initial;
  });
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
