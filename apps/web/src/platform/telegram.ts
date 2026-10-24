import { useEffect } from 'react';

interface TelegramApp {
  initData: string;
  colorScheme: 'light' | 'dark';
  safeAreaInset?: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
  ready: () => void;
  expand: () => void;
  onEvent: (event: string, handler: () => void) => void;
  offEvent: (event: string, handler: () => void) => void;
  BackButton: { show: () => void; hide: () => void; onClick: (handler: () => void) => void; offClick: (handler: () => void) => void };
  isVersionAtLeast: (version: string) => boolean;
  openInvoice: (url: string, callback: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  shareMessage?: (id: string, callback: (success: boolean) => void) => void;
  openTelegramLink: (url: string) => void;
}

export function telegram(): TelegramApp | undefined {
  return (window as Window & { Telegram?: { WebApp?: TelegramApp } }).Telegram?.WebApp;
}

export const config = {
  mocks: import.meta.env.VITE_USE_MOCKS === 'true',
  apiBase: ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api').replace(/\/+$/, ''),
  // TODO Q-CONFIG: owner must supply the real bot username and published legal URL.
  botUsername: import.meta.env.VITE_BOT_USERNAME as string | undefined,
  termsUrl: import.meta.env.VITE_TERMS_URL as string | undefined,
};

// A sheet temporarily owns Telegram Back; underlying screens keep their handler.
const backHandlers: { back?: () => void }[] = [];
const dispatchBack = () => backHandlers.at(-1)?.back?.();
function updateBackButton(app: TelegramApp) {
  if (backHandlers.at(-1)?.back) {
    app.BackButton.show();
  } else {
    app.BackButton.hide();
  }
}

export function useTelegram(back?: () => void) {
  useEffect(() => {
    const app = telegram();
    if (!app?.initData) {
      return;
    }
    const update = () => {
      document.documentElement.dataset.theme = app.colorScheme;
      for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
        const inset = (app.safeAreaInset?.[edge] ?? 0) + (app.contentSafeAreaInset?.[edge] ?? 0);
        document.documentElement.style.setProperty(`--safe-${edge}`, `${inset}px`);
      }
    };
    app.ready();
    app.expand();
    update();
    app.onEvent('themeChanged', update);
    app.onEvent('safeAreaChanged', update);
    app.onEvent('contentSafeAreaChanged', update);
    const entry = { back };
    if (!backHandlers.length) {
      app.BackButton.onClick(dispatchBack);
    }
    backHandlers.push(entry);
    updateBackButton(app);
    return () => {
      app.offEvent('themeChanged', update);
      app.offEvent('safeAreaChanged', update);
      app.offEvent('contentSafeAreaChanged', update);
      const index = backHandlers.indexOf(entry);
      if (index >= 0) {
        backHandlers.splice(index, 1);
      }
      updateBackButton(app);
      if (!backHandlers.length) {
        app.BackButton.offClick(dispatchBack);
      }
    };
  }, [back]);
}
