# API MVP

Техническое руководство по текущему бэкенду: HTTP API, worker и данные MongoDB.

## Начало работы

| Что | Зачем | Ссылка | Статус |
|---|---|---|---|
| Запуск | Два процесса, сборка, тесты, Swagger | [Setup](setup.md) | актуально |
| Конфигурация | Имена переменных и область действия | [Config](config.md) | актуально |
| Вход и ошибки | Права, Problem, повторы запросов | [Errors/auth](errors.md) | актуально |
| Ограничения | Блокер общего check, непроверенные интеграции | [Backend](../limitations/backend.md) | актуально |

## Модули

| Что | Зачем | Ссылка |
|---|---|---|
| users | Профиль, onboarding, удаление | [Users](modules/users.md) |
| tasks | Задачи и строгий жизненный цикл периодов | [Tasks](modules/tasks.md) |
| task-notifications / pressure | Единое расписание пользователя | [Notifications](modules/task-notifications.md) |
| delivery | Outbox, лента, ответы на проверки | [Delivery](modules/delivery.md) |
| respect | Награды и штрафы без двойного начисления | [Respect](modules/respect.md) |
| phrases | Пул, выбор и оценки фраз | [Phrases](modules/phrases.md) |
| battle | Диалог, цитаты, транзакционный ход | [Battle](modules/battle.md) |
| strikes | Партии, резерв и возврат ударов | [Strikes](modules/strikes.md) |
| payments | Счета, подтверждения и сверка Stars | [Payments](modules/payments.md) |
| ai | Проверка задач, судья, актёр, summary | [AI](modules/ai.md) |
| bot | Вебхук и дедупликация Telegram updates | [Bot](modules/bot.md) |
| analytics | Метрики, настройки и журнал владельца | [Analytics](modules/analytics.md) |
| sharing | Подготовка анонимизированной карточки | [Sharing](modules/sharing.md) |
| leaderboard | Топ и участие пользователя | [Leaderboard](modules/leaderboard.md) |

## Данные и интеграции

| Что | Зачем | Ссылка |
|---|---|---|
| User | Операционное состояние и удаление | [User](data/user.md) |
| Task / Period | Связь задачи и отдельных сроков | [Task](data/task.md) |
| BattleDialog | История, ход и сжатый контекст | [Dialog](data/battle-dialog.md) |
| StarsPayment | Финансовые снимки и инциденты | [Payment](data/stars-payment.md) |
| Telegram | Bot API и ограничения доставки | [Telegram](integrations/telegram.md) |
| Stars | Внешняя оплата и возврат | [Stars](integrations/stars.md) |
| OpenAI-совместимый ИИ | Провайдер, пять промптов, usage и eval | [AI](integrations/ai.md) |

## Первоисточники

| Что | Зачем | Ссылка | Статус |
|---|---|---|---|
| Контракт | DTO, enum, поля, параметры и ответы | [YAML](../openapi.yaml), [JSON](../openapi.json) | актуально |
| Архитектура | Границы модулей и подробные сущности | [Модули](../architecture/mvp/modules.md), [решения](../architecture/mvp/decisions.md) | актуально с оговорками в Backend |
| ТЗ | Назначение и пользовательские сценарии | [MVP](../specs/mvp/spec.md) | уточнено D3–D10 |
| Проверки | Фактический результат и пределы 176 тестов | [Результаты](../testing/mvp-backend-results.md) | актуально |
| Ревью | Семь дефектов, исправления, повторные проверки | [Отчёт](../architecture/mvp/backend-review.md) | завершено |
