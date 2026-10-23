import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    // API has a catch-all handler; static assets and Telegram SDK are ordinary resources.
    await worker.start({ onUnhandledFrame: 'bypass' });
  }
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
}

void bootstrap().catch(() => {
  createRoot(document.getElementById('root')!).render(
    <main className="page">
      <h1>Приложение не запустилось</h1>
      <p role="alert">Не удалось включить демонстрационные данные. Проверь подключение и обнови страницу.</p>
      <button className="btn" onClick={() => window.location.reload()}>Повторить запуск</button>
    </main>,
  );
});
