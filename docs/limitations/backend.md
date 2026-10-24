# Ограничения и расхождения бэкенда MVP

Исторические результаты этапа `feat/mvp-api` и сохраняющиеся ограничения бэкенда. Подключение ИИ и уведомления после merge `f3abb78` описаны в [отдельной сверке](ai-and-notifications.md); этот файл не подтверждает готовность к деплою.

## Общий шлюз и клиентский контракт

Блокер ниже исторический: после стыковки и merge `f3abb78` текущий `npm run check` прошёл при обновлении документации (контракт, типы клиента, безопасность БД, lint, typecheck). Отчёт предыдущего этапа сохранён как источник его результатов.

На прежнем этапе по [итоговому отчёту](../testing/mvp-backend-results.md#статический-шлюз-и-стыковка), `check:openapi` проходит, затем общий `npm run check` останавливается на `check:api`: generated frontend-типы устарели. Последующие шаги общего запуска не выполняются. Отдельные успешные lint/typecheck и 176 тестов API не заменяют зелёный общий шлюз.

Исторический контекст: в main находился фронтенд `f0a3956`, API worktree был основан на `3aeb394`. Тогда исправления бэкенда не адаптировали фронт; последующая [стыковка](../web/api-integration.md) устранила этот блокер. Фактический code-first экспорт не содержит 12 прежних отдельных enum alias names, на которые ссылается клиент; это не обещание вернуть aliases. Добавлены также два действия owner-журнала. Решение о стыковке пользователь передал оркестратору для согласования и распределения работы.

Источники обеих сторон: [D9 и самостоятельная генерация frontend-типов](../architecture/mvp/api-contract.md), [сохранённый YAML](../openapi.yaml), [JSON](../openapi.json), [статус клиентской несовместимости](../testing/mvp-backend-results.md#статический-шлюз-и-стыковка). В этом шаге frontend не проверялся и не изменялся.

## Уточнения старых проектных описаний

- [Modules](../architecture/mvp/modules.md) содержит проектные маршруты/имена файлов: например, `done|extend|give-up`, `replies`, единственное `invoice`, `POST` оценки. Реальные [контроллеры tasks](../../apps/api/src/modules/tasks/controllers/user-tasks.controller.ts), [battle](../../apps/api/src/modules/battle/controllers/user-battle.controller.ts), [payments](../../apps/api/src/modules/payments/controllers/user-payments.controller.ts), [delivery](../../apps/api/src/modules/delivery/controllers/user-delivery.controller.ts) и [OpenAPI](../openapi.yaml) используют `completion|extension|surrender`, `messages/quotes`, `invoices` и `PUT` оценки/ответа. По D9 руководство следует фактическому контракту; проектный список не является дополнительным набором endpoint.
- [Period](../architecture/mvp/entities/period.md) ещё описывает поля независимого расписания; [D6](../architecture/mvp/task-notifications.md) заменил его единым состоянием пользователя в [TaskNotificationState](../architecture/mvp/entities/task-notification-state.md). Старые обязательные минимумы проверок каждой задачи не действуют.
- Диаграмма [StarsPayment](../architecture/mvp/entities/stars-payment.md) с обязательным `paid` уточнена [D5](../architecture/mvp/decisions.md#принято): обычное подтверждение сразу переводит `invoiced` в `credited` в транзакции с начислением. Реализация: [PaymentsService](../../apps/api/src/modules/payments/payments.service.ts).
- Разделы «Проверка» в [контракте](../architecture/mvp/api-contract.md#проверка), [аналитике](../architecture/mvp/analytics.md#проверка), [расписании](../architecture/mvp/task-notifications.md#проверка) и статусы будущих сценариев в [handoff](../testing/mvp-backend-handoff.md) описывают прежний момент до ревью/тестов. Текущий итог — [результаты тестов](../testing/mvp-backend-results.md), без заявления покрытия всей исходной матрицы. Первичные артефакты в шаге документации не переписаны.

## Границы доказанного

Независимое ревью нашло семь дефектов, все исправлены. Повторные ревью диффов 1–3, 4–7 и Jest-конфигурации не нашли замечаний. `npm test -w api` на Node.js 22.17.0: 15 suites passed, 176 tests passed, 0 failed, 0 skipped. Прогон с разрешением Docker-сокета выполнил родитель; временный Mongo-контейнер и данные удалены. Источники: [ревью](../architecture/mvp/backend-review.md), [результаты](../testing/mvp-backend-results.md).

Не закрыта вся матрица handoff: остаются отдельные гонки удаления во время отправки, ошибки БД вокруг send, варианты восстановления аренд, расширенные когорты, CAS summary и lifecycle/start-команды. Нет нагрузочной проверки и подтверждения NFR по доступности/задержкам; живые Telegram/Stars не подтверждены. Фронт позднее [состыкован с API](../web/api-integration.md), реальный ИИ подключён в `aadac8d`, но полный eval не подтверждён: [новые границы](ai-and-notifications.md). [Требования](../specs/mvp/nfr.md) и [пределы выполненного набора](../testing/mvp-backend-results.md#пределы) должны оцениваться раздельно.

## Допустимые ограничения гарантий

Статистика первых событий/дневной активности по D8 и два новых события owner-журнала по D10 доставляются асинхронно в процессе, без постоянной очереди и восстановления. Редкая потеря допустима; финансовые переходы сохраняют транзакционные гарантии. Источники: [аналитика](../architecture/mvp/analytics.md#доставка-событий-по-d8), [D10](../architecture/mvp/decisions.md#принято).

Mongo-аренды и дедупликация updates не гарантируют единственной внешней отправки при потере ответа Telegram. Неизвестный исход требует осторожного окна частоты; таймер неответа начинается только после подтверждения. [Политика уведомлений](../architecture/mvp/task-notifications.md), [доставка](../../apps/api/src/modules/delivery/services/dispatcher.service.ts).

Экономика в USD — модель по снимкам курса/тарифов, без расчёта налогов и вывода Stars. Неизвестные и подставные расходы дают `null`, а не достоверные 0%. Реальный провайдер подключён; проверка N-14/N-15 остаётся отдельной задачей: [формулы](../architecture/mvp/analytics.md#деньги-и-тарифы), [требования](../specs/mvp/nfr.md).
