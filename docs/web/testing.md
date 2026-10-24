# Проверки frontend MVP

Документ фиксирует итоговые доказательства координатора, переданные документирующей роли 2026-10-24, и сопоставляет их с текущими тестами. Эта роль прочитала код и команды, но не запускала тесты, dev-server, Docker, API или внешние сервисы. Frontend реализован в `codex/mvp-web` отдельно; backend находится в другом worktree, общая сборка и интеграция впереди.

## Итоговые доказательства

- `npm test -w web`: **47 passed, 0 failed, 0 skipped**, 7 файлов. Результат полного прогона после исправлений. Состав: [unit](../../apps/web/test/unit), [integration](../../apps/web/test/integration), [helpers](../../apps/web/test/helpers).
- `npm run test:browser -w web`: **7 passed, 0 failed**, 6.7 секунды, один headless установленный Google Chrome, ширины 390 и 320. Координатор выполнил runner с необходимым разрешением ОС после первоначального sandbox-блокера.
- Финальные `npm run check` и `npm run build -w web` выполнены координатором после завершения документирования: **PASS**, exit 0. `git diff --check` также прошёл. Это статический шлюз и сборка, отдельно от проверок поведения выше.

Все команды существуют в [web/package.json](../../apps/web/package.json) и [корневом package.json](../../package.json). Сверка команд не означает их выполнение этой ролью.

## Что проверено базовым набором

Vitest/RTL/jsdom используют настоящий продуктовый HTTP-клиент и управляемый MSW на границе HTTP. Проверяются Authorization, path/query/JSON/key, серверные отказы, отсутствие auto retries, отмена и сетевые ошибки; форма/расписание и R-22 для N=1/31; защита lost POST после remount; архив/пагинация; серверная фраза и кеш успешного завершения при следующем GET 503; ответы на проверки; polling боя; повтор той же попытки key/body; сессия/activated и черновики; настройки/удаление; обработчики Telegram Back и возврат фокуса. Unit-набор отдельно проверяет словарь recurrence.

Источники: [HTTP](../../apps/web/test/integration/http.test.ts), [задачи](../../apps/web/test/integration/tasks.test.tsx), [бой](../../apps/web/test/integration/battle.test.tsx), [сессия](../../apps/web/test/integration/session.test.tsx), [платформа](../../apps/web/test/integration/platform.test.tsx), [recurrence](../../apps/web/test/unit/recurrence.test.ts), [исходный app test](../../apps/web/test/unit/app.test.tsx).

jsdom shim открывает/закрывает dialog, но не доказывает native focus trap, inert или геометрию. Предупреждение jsdom о `window.scrollTo` относится к ограничению этого слоя.

## Что проверено в браузере

[mvp.spec.ts](../../apps/web/test/browser/mvp.spec.ts) содержит 7 сценариев:

1. Onboarding → первая задача → серверная фраза → главная → завершение.
2. Архив → закрытая карточка → reload → Telegram Back → главная.
3. Потерянный ответ POST → reload → guard и проверка списка без второго POST.
4. Same-session activated сохраняет маршрут, открытую форму и черновик после обновления профиля.
5. Native Tab/Shift+Tab, Escape, Telegram Back, inert фона и возврат фокуса инициатору.
6. Мобильная ширина 390: длинные названия, отсутствие overflow, форма, тема Telegram и safe-area.
7. Те же мобильные проверки при ширине 320.

[fixtures.ts](../../apps/web/test/browser/fixtures.ts) заменяет API маршрутами Playwright и устанавливает Telegram double до загрузки продукта; SDK также перехватывается. Неизвестные внешние запросы и ошибки страницы проваливают тест. Это браузерный прогон frontend с управляемыми ответами, не E2E с настоящим backend или Telegram.

[Playwright config](../../apps/web/playwright.config.ts) использует один worker, без retries, `channel: chrome`, блокировку service workers и собственный Vite test-server на loopback:4179. `reuseExistingServer: false`; по сообщению координатора сервер после выхода остановлен. [Vite test config](../../apps/web/vite.test.config.ts) выключает envDir/public/proxy и продуктовый MSW. Изменение browser dependencies на этапе: `@playwright/test ^1.64.1` в devDependencies web; `playwright`/`playwright-core` подтянуты транзитивно, lockfile изменён. Других зависимостей на этом этапе не добавляли.

## История исправлений и отчётов

Первичный code-review нашёл 7 дефектов, они исправлены. Базовый тестовый этап обнаружил R-22: исходные 2 failures исправлены, узкое code-review не нашло замечаний. Browser выявил цикл Tab; также исправлены сохранение черновика при same-session activated и test locator серверной цитаты. Узкие повторные code-review новых дефектов не нашли, по итоговому сообщению координатора.

Первый запуск browser остановился **до тестов**: `listen EPERM ... 127.0.0.1:4179`. Затем промежуточный прогон дал 4 passed / 2 failed. История и более поздний итог координатора **7/0** сохранены в [apps/web/test/README.md](../../apps/web/test/README.md). Промежуточный blocked/4–2 не является текущим итогом.

## Граница результата

При первоначальной передаче frontend E2E с backend/MongoDB не выполнялся. При последующей [стыковке API](api-integration.md) прошёл локальный реальный HTTP/БД smoke. Реальные Telegram, Stars, внешний ИИ и уведомления этим smoke не проверены. Не заявляются полный WCAG, все 14 экранов/196 состояний дизайна, все функции владельца/платежей/шеринга, все серверные правила или готовность всей фичи. Двойники проверяют реакцию web на ответы; полноту интеграций нужно проверять отдельно от узкого локального smoke. Карта продукта остаётся ответственностью координатора.

## Стыковка фактического API · 2026-10-24

Итог координатора: `npm run check`, `npm run build -w web`, 52 Vitest-теста (включая 5 дополнительных вариантов malformed JSON в существующем HTTP-тесте) и 7 Playwright-тестов прошли. [Отдельный отчёт](api-integration.md) фиксирует настоящий HTTP/БД smoke и временный backend snapshot.
