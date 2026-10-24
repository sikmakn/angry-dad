# Стыковка frontend с фактическим API · 2026-10-24

Ветка `codex/mvp-api-connect`, worktree `/Users/nikitakolchanov/.codex/worktrees/mvp-api-connect/angry-dad`, база main `f0a3956`. Пользователь одобрил общий коммит и локальное слияние 2026-10-24; итоговые backend-исходники и frontend-стыковка закрываются одной веткой. Push не запрашивался. Утверждённые экраны сохранены.

## Изменения frontend

Generated `apps/web/src/api/generated/openapi.ts` пересобран штатным `npm run generate:api` по экспортированному Nest контракту D9. Двенадцать коротких enum-алиасов выведены из полей DTO в `api/contract.ts`; их применения адаптированы в battle/history/tasks/owner. HTTP DTO вручную не дублируются. OwnerJournal показывает также `paraphrase_generate` и `support_ticket_status_changed`.

Vite сохраняет `/api`: сервер уже имеет этот global prefix. Base URL клиента удаляет завершающие слеши. Ошибки proxy с HTML, пустым или посторонним JSON не трактуются как Problem; существующий HTTP-тест расширен malformed JSON-вариантами. Обычные problem+json сохраняют reply/errors/periodStatus. Авторизация остаётся `Authorization: tma <initData>`, без обхода подписи. Автоматических повторов записей нет.

Все 50 клиентских operationId/HTTP методов/путей сравнены с фактическим `docs/openapi.json`: расхождений нет. Required/nullable/body/query/result проходят строгую frontend сборку по новым generated-типам, включая typed MSW fixtures.

## Источник backend и финальная сверка

Источник: `/Users/nikitakolchanov/programs/angry-dad/.claude/worktrees/feat-mvp-api`. [Полный manifest](backend-snapshot.json) содержит timestamp и SHA256 320 скопированных файлов: `apps/api` (src, конфигурация и тестовые helpers/tests), `scripts/docs/generate-openapi.mjs`, `docs/openapi.yaml`, `docs/openapi.json`, `eslint.config.mjs`. Удалён прежний main `apps/api/test/unit/app.module.spec.ts`, уже удалённый источником. Скрипты и devDependencies root package.json объединены с сохранением frontend MSW; lockfile разрешён `npm install --ignore-scripts`. При закрытии исходники API и frontend-стыковка включаются в один общий коммит; manifest сохраняет происхождение backend-копии. Новых frontend-зависимостей нет.

.env/секреты/node_modules/.git/dist из backend worktree не копировались. Сторонняя рабочая папка только читалась. Первоначальная передача предшествовала завершению backend-тестов. При закрытии перенесены окончательные `ai.spec.ts`, `social.spec.ts`, `tasks.spec.ts`, руководство API, архитектурные решения и отчёты. Manifest обновлён: расхождений runtime, конфигурации, контрактов и перечисленных тестов с финальным source нет. Документы обеих сторон объединены с сохранением истории.

## Проверки

При закрытии общей ветки повторно прошли `npm run check`, `npm run build` обоих приложений, 176 backend-тестов на временной MongoDB и 52 frontend-теста. Браузерные прогоны ниже относятся к предшествующей передаче стыковки и не повторялись при обновлении backend-тестов и документации.

- `npm run generate:api`, `npm run check` (Nest export check, generated API check, database safety, ESLint, типы API/web), `npm run build -w web` — успешно.
- `npm test -w web`: 7 файлов / 52 теста, HTTP заменён MSW; это frontend проверки.
- `npm run test:browser -w web`: 7/7 на Chrome, API заменён Playwright routes; MSW выключен.
- Отдельный живой smoke: Chromium → продуктовый Vite config `/api` proxy → Nest HTTP с global prefix → временная изолированная MongoDB replica set. `VITE_USE_MOCKS=false`, service workers заблокированы, API routes не перехватывались.

В живом smoke синтетический host Telegram предоставил initData, подписанный штатным helper и тестовым токеном. Через UI прошли onboarding (200), создание задачи (201), завершение периода (200), reload закрытой карточки. Прямой запрос к тестовой БД подтвердил ровно одну задачу и статус closed. Повторное завершение через продуктовый request-клиент получило 409 period_not_active/periodStatus done и текст «Задача уже закрыта». Неверная подпись на настоящем guard получила 401 application/problem+json. Ошибок JS страницы не было. БД и её контейнер удалены штатным with-test-mongo runner.

Воспроизводящий временный runner этой сессии: `/private/tmp/angry-dad-live-smoke.cjs`; запуск из worktree: `node scripts/testing/with-test-mongo.mjs -- node /private/tmp/angry-dad-live-smoke.cjs`. Runner использует `apps/api/test/helpers/backend.ts` и `env.setup.ts`, случайный порт API/Vite и установленный Chrome. Файл временный, не часть постоянной тестовой системы.

## Оставшиеся границы

AI/Telegram/Stars в живом smoke — штатные backend test providers; реальных внешних вызовов/платежей/доставки не было. Проверка не покрывает все 14 экранов, фоновые уведомления и кабинет владельца на настоящем API. Production нужен same-origin reverse proxy `/api`; Nest CORS пока не включает.

Новый контракт по-прежнему возвращает только preparedMessageId для share, не содержит onSuccess snapshot после reload и не раскрывает lastExtendedOn. UI не выдумывает эти поля. POST /tasks не имеет idempotency key; guard неизвестного результата и защита повторов сохранены. Формы создания пакета/game-settings отсутствуют в утверждённом дизайне и не добавлялись. VITE_BOT_USERNAME/VITE_TERMS_URL ожидают данных владельца. Детали — [ограничения](../limitations/README.md).
