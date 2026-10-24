# Разработка и запуск web

Все команды ниже выполняются из корня репозитория и сверены с [корневым package.json](../../package.json) и [web/package.json](../../apps/web/package.json). Это инструкции для разработчика; документирующая роль серверы и тесты не запускала. Фактически выполненные координатором проверки вынесены в [testing.md](testing.md).

## Команды

После получения checkout с зависимостями по lockfile используют `npm ci`. Для frontend предусмотрены:

```sh
npm run dev -w web
npm run build -w web
npm run preview -w web
npm run typecheck -w web
npm test -w web
npm run test:browser -w web
npm run check
```

`test:base` — второй script для `vitest run`. `npm run lint -w web` вызывает общий lint репозитория. Корневой `build` собирает все workspace; `npm run build -w web` собирает только web. Шлюз `check` проверяет generated OpenAPI, безопасность тестовой БД, ESLint и типы обоих приложений; он не запускает backend и не заменяет тесты поведения.

`npm run generate:openapi` экспортирует YAML/JSON из NestJS controllers/DTO/Swagger без БД; `npm run check:openapi` проверяет их актуальность. YAML/JSON руками не редактируют. `npm run generate:api` обновляет generated типы по OpenAPI; `npm run check:api` проверяет их актуальность. Менять generated файл вручную не следует. `npm run docs:api` предназначен для просмотра контракта, не для запуска приложения.

## Реальный API

При выключенных моках [клиент](../../apps/web/src/api/client.ts) выполняет HTTP-запросы с Telegram `initData`. В обычном браузере без платформенного входа приложение показывает просьбу открыть Telegram, запрос профиля не выполняется.

По [vite.config.ts](../../apps/web/vite.config.ts) путь `/api` проксируется к локальному API на `http://127.0.0.1:3000`, префикс `/api` сохраняется: NestJS `main.ts` использует `setGlobalPrefix('api')`. `API_TARGET` задаёт origin сервера без `/api`. Это настройка dev/preview. Для размещения необходим эквивалентный маршрут reverse proxy либо доступный API по настроенному base URL с подходящими правилами доступа. Проверен путь Chromium → Vite proxy → Nest → изолированная MongoDB; подробности и границы — [api-integration.md](api-integration.md). Nest не включает CORS; для браузерного production-доступа нужен same-origin reverse proxy `/api`, либо отдельно согласованная настройка CORS для другого origin.

## Конфигурационные точки

Имена подтверждены [адаптером Telegram](../../apps/web/src/platform/telegram.ts), [Vite config](../../apps/web/vite.config.ts) и безопасным [примером конфигурации](../../apps/web/.env.example). Значения секретных окружений для этой документации не читались.

- `VITE_USE_MOCKS`: только точное `true` включает демонстрацию. Для реального API выключить.
- `VITE_API_BASE_URL`: base URL клиента, по умолчанию `/api`.
- `API_TARGET`: адрес API для dev/preview proxy, читается из окружения процесса Vite.
- `VITE_BOT_USERNAME`: username бота для ссылки открытия; окончательный username ещё не предоставлен.
- `VITE_TERMS_URL`: опубликованные условия и политика; окончательный текст и URL ещё не предоставлены владельцем.

`VITE_*` входят в клиентскую сборку и не предназначены для секретов. Изменение требует нового запуска Vite или пересборки.

## Демонстрация MSW

Для локальной демонстрации задают `VITE_USE_MOCKS=true` перед `npm run dev -w web`. [main.tsx](../../apps/web/src/main.tsx) сначала поднимает service worker, затем React. В демонстрационную сборку включается worker из `public`; реальная сборка исключает эту папку через `publicDir: false`.

[Handlers](../../apps/web/src/mocks/handlers.ts) и [fixtures](../../apps/web/src/mocks/fixtures.ts) заменяют API в браузере. Используются демонстрационная сессия, ответы и память текущей загрузки страницы; после reload данные сбрасываются. Приложение показывает пометку MSW. Неизвестные пути API закрывает catch-all, а статические ресурсы и SDK проходят отдельно. Это не тест безопасности и не реализация backend, планировщика или ИИ.

Оплата и отправка карточки в режиме моков отключены. Уведомления ботом не отправляются. Browser tests используют другой управляемый API double, не этот worker: см. [проверки](testing.md).
