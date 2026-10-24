# Конфигурация бэкенда

Ниже только имена переменных, без значений окружения. Источник — [AppConfigService](../../apps/api/src/config/app-config.service.ts), режим загрузки — [ConfigModule](../../apps/api/src/config/config.module.ts). Названия не означают, что подключение внешних сервисов уже проверено.

## Процессы и база

- `PORT` — HTTP-порт API; worker HTTP не слушает.
- `MONGODB_URI` — подключение API и worker к MongoDB replica set.
- `NODE_ENV` — в тестовом режиме загрузка env-файла отключена.
- `OPENAPI_EXPORT` — внутренний флаг генератора контракта; не режим обычного сервера. Генератор выставляет его сам и отключает чтение env-файла.

## Telegram, вход и удаление

- `TELEGRAM_BOT_TOKEN` — Bot API и проверка подписи Mini App.
- `TELEGRAM_WEBHOOK_SECRET` — секрет заголовка входящего вебхука.
- `OWNER_TELEGRAM_ID` — Telegram ID с доступом к owner-операциям.
- `TELEGRAM_AUTH_MAX_AGE_SECONDS` — допустимый возраст подписанных данных запуска.
- `DELETION_HASH_SALT` — соль хеша Telegram ID в отметке удалённого аккаунта.
- `MINI_APP_URL` — ссылка открытия приложения из бота.
- `BOT_URL` — ссылка бота, в том числе для карточки шеринга.

## Подставные клиенты и AI

- `EXTERNAL_CLIENTS_MODE` — при значении `test` используются подставные внешние клиенты. Это не sandbox самого Telegram/Stars и не подтверждение готовности реальных интеграций.
- `AI_API_URL`, `AI_API_KEY` — endpoint и ключ настроенного AI gateway.
- `AI_SMART_MODEL`, `AI_FAST_MODEL` — модели групп задач: judge/actor и specificity/summary/paraphrase соответственно.
- `AI_MODEL` — общее переопределение модели.
- `AI_MODEL_SPECIFICITY`, `AI_MODEL_JUDGE`, `AI_MODEL_ACTOR`, `AI_MODEL_SUMMARY`, `AI_MODEL_PARAPHRASE` — переопределение отдельной задачи; приоритет выше общего и группового.

## Денежная оценка

- `STARS_USD_PER_STAR` — оценка Star в USD.
- `AI_SMART_INPUT_USD_PER_MILLION`, `AI_SMART_OUTPUT_USD_PER_MILLION` — тарифы входа/выхода SMART.
- `AI_FAST_INPUT_USD_PER_MILLION`, `AI_FAST_OUTPUT_USD_PER_MILLION` — тарифы FAST.

При смене модели нужно согласовать тарифы её группы. Денежные параметры проверяются при использовании: конечное неотрицательное число, курс Stars строго положительный. Снимки курса и тарифов сохраняют историю; неизвестные расходы не заменяются нулём. Подробности: [денежная аналитика](../architecture/mvp/analytics.md#деньги-и-тарифы).

Коэффициенты боя, суточный лимит проверки задач и параметры выбора фраз — данные `GameSettings`, изменяемые owner API, а не переменные окружения. Политика уведомлений задаётся [кодом политики](../../apps/api/src/modules/task-notifications/task-notifications.policy.ts), отдельного HTTP API её настройки нет.

## Тестовое окружение

`TEST_MONGODB_URI`, `TEST_MONGO_RUN_ID`, `TEST_MONGO_CONTAINER_ID` устанавливает [раннер](../../scripts/testing/with-test-mongo.mjs), а не оператор вручную для подключения существующей базы. Он передаёт дочернему процессу ограниченное окружение и не наследует прикладные секреты вызывающего shell.
