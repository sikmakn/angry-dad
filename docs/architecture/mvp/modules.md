# Модули · [← сводка](00-overview.md)

Раскладка папок по `api-layout.md`. Маршруты даны в общих чертах, точный контракт — шаг contract. «Владелец» — контроллеры с guard'ом по Telegram ID владельца ([Q1](decisions.md#q1)).

Порядок зависимостей (сверху никто не зависит от нижних): `ai`, `analytics` → `users` → `phrases`, `respect`, `strikes` → `tasks`, `battle`, `payments` → `pressure`, `delivery`, `sharing`, `leaderboard` → `bot`.

## users
**Отвечает за:** вход по `initData`, профиль (роль, пол, пояс, тихие часы, участие в рейтинге), старт, удаление аккаунта, отметку активности, guard владельца.
**Сущности:** [User](entities/user.md), [DeletedUser](entities/deleted-user.md)
**Контроллеры:** пользователь — профиль, старт, настройки, удаление; владелец — поиск пользователя по Telegram ID.
**Зависит от:** analytics. Удаление вызывает очистку в tasks, battle, delivery, phrases, strikes через события модулей.
**Сервисы:** `users.service` (профиль, старт, настройки); `services/account-deletion.service` (удаление: рассылает событие, стирает данные); `services/telegram-auth.service` (проверка `initData`).
**Маршруты:** пользователь `GET/PATCH /me`, `POST /me/onboarding`, `DELETE /me`; владелец `GET /owner/users/{telegramId}`.
**Guards:** `guards/telegram-auth.guard.ts` (все пользовательские маршруты), `guards/owner.guard.ts` (общий для всех owner-контроллеров), `guards/onboarded.guard.ts`.
```
modules/users/
  users.module.ts  users.service.ts  users.errors.ts  users.types.ts
  controllers/ me.controller.ts  owner-users.controller.ts
  services/ account-deletion.service.ts  telegram-auth.service.ts
  guards/ telegram-auth.guard.ts  owner.guard.ts  onboarded.guard.ts
  dto/
```
**Сценарии:** UC-1…UC-12

## bot
**Отвечает за:** вебхук Telegram: `/start`, `/terms`, `/paysupport`, нажатия кнопок под сообщениями (ответы на проверки, «Готово», продление, «Сдаюсь», оценки), `pre_checkout_query`, `successful_payment`, блокировку бота (`my_chat_member`). Только разбор и передача в модули, логики нет.
**Сущности:** нет своих.
**Контроллеры:** вебхук (проверка секретного токена Telegram).
**Зависит от:** users, tasks, pressure, phrases, payments, delivery.
**Сервисы:** `bot.service` (grammY, регистрация обработчиков); `services/button-router.service.ts` (разбор `callback_data` и сверка `from.id`); `services/telegram-client.service.ts` (исходящие вызовы Bot API за интерфейсом, подставной клиент в тестах).
**Маршруты:** вебхук `POST /telegram/webhook`.
```
modules/bot/
  bot.module.ts  bot.service.ts  bot.types.ts
  controllers/ telegram-webhook.controller.ts
  services/ button-router.service.ts  telegram-client.service.ts
  helpers/ callback-data.ts
```
**Сценарии:** UC-1, UC-6, UC-19, UC-32…UC-36, UC-40, UC-54, UC-72…UC-75

## tasks
**Отвечает за:** постановку задачи (проверка конкретности и размер через ai, суточный лимит), периодичность и периоды, переходы статусов, продление, «Сделаю за час», «Сдаюсь», удаление и остановку, настроение, переходы по дедлайну (воркер). Каждый переход сообщает pressure и respect.
**Сущности:** [Task](entities/task.md), [Period](entities/period.md)
**Контроллеры:** пользователь — задачи, периоды, действия над текущим периодом.
**Зависит от:** ai, respect, phrases (ответные фразы), users.
**Сервисы:** `tasks.service` (постановка, список, удаление); `services/periods.service.ts` (создание и закрытие периодов, переходы); `services/deadline-sweeper.service.ts` (воркер: провал по сроку, открытие периодов); `services/recurrence.service.ts` (расчёт периодов и сроков по пяти периодичностям); `services/mood.service.ts`.
**Маршруты:** пользователь `GET/POST /tasks`, `PATCH/DELETE /tasks/{id}`, `POST /tasks/{id}/stop`, `GET /tasks/{id}/periods`, действия текущего периода `POST /periods/{id}/done|extend|give-up|retry`, `POST /periods/{id}/check-in-answer`.
```
modules/tasks/
  tasks.module.ts  tasks.service.ts  tasks.errors.ts  tasks.types.ts
  controllers/ tasks.controller.ts  periods.controller.ts
  services/ periods.service.ts  recurrence.service.ts  mood.service.ts  deadline-sweeper.service.ts
  helpers/ recurrence-keywords.ts
  dto/
```
**Сценарии:** UC-13…UC-31

## pressure
**Отвечает за:** планирование сообщений: случайное расписание проверок (R-48, R-49, R-55), серии (R-50), напоминания (R-57, R-58), onFail (R-59), onAbsent (R-60); отмену по смене статуса (R-63); штраф за неответ (R-52). Пишет записи `OutboxMessage`, сам не отправляет.
**Сущности:** [OutboxMessage](entities/outbox-message.md) (пишет план)
**Контроллеры:** нет; ответы на проверки приходят из bot и из Mini App через tasks.
**Зависит от:** tasks, respect, battle (уровень побеждённости для растяжения интервалов), users.
**Сервисы:** `pressure.service` (точка входа: «пересчитай план по периоду»); `services/check-in-planner.service.ts` (случайные интервалы, минимум за сутки, растяжение по уровню побеждённости); `services/series.service.ts`; `services/reminder-planner.service.ts` (напоминания и onFail); `services/absence-planner.service.ts`; `services/missed-check-in.service.ts` (воркер: 15 минут без ответа).
**Маршруты:** нет.
```
modules/pressure/
  pressure.module.ts  pressure.service.ts  pressure.types.ts
  services/ check-in-planner.service.ts  series.service.ts  reminder-planner.service.ts  absence-planner.service.ts  missed-check-in.service.ts
  helpers/ interval-sampler.ts
```
**Сценарии:** UC-32…UC-43, UC-31

## delivery
**Отвечает за:** диспетчер отправки на пользователя: тихие часы (отмена проверок, перенос и слияние остального), минимум 3 минуты и приоритеты (R-62), отброс опоздавших (N-4), лимиты Telegram (N-7), блокировка бота (R-65); выбор и подстановку фразы в момент отправки; ленту «История» и «Ответить».
**Сущности:** [OutboxMessage](entities/outbox-message.md) (исполняет), [FeedMessage](entities/feed-message.md)
**Контроллеры:** пользователь — «История».
**Зависит от:** phrases, users, tasks (настроение и статус на момент отправки), battle (побеждённость).
**Сервисы:** `delivery.service` (отправить сообщение пользователю сейчас); `services/dispatcher.service.ts` (воркер: берёт записи в аренду, применяет тихие часы, 3 минуты, приоритеты, слияние, N-4); `services/rate-limiter.service.ts` (лимиты Telegram, откладывание); `services/feed.service.ts` («История», ответ на проверку, ссылка «Ответить»); `services/message-builder.service.ts` (фраза + кнопки).
**Маршруты:** пользователь `GET /feed`.
```
modules/delivery/
  delivery.module.ts  delivery.service.ts  delivery.types.ts
  controllers/ feed.controller.ts
  services/ dispatcher.service.ts  rate-limiter.service.ts  feed.service.ts  message-builder.service.ts
  helpers/ quiet-hours.ts
```
**Сценарии:** UC-35, UC-38…UC-43, UC-55, UC-59

## respect
**Отвечает за:** единственная точка изменения уважения: таблица событий F-8, шаг 0.5, потолок 94 и 100 после слома, суточный потолок штрафов 3, защита от двойного начисления по ключу события.
**Сущности:** [RespectChange](entities/respect-change.md); значение лежит в [User](entities/user.md)
**Контроллеры:** нет (значение отдаёт users).
**Зависит от:** users.
**Сервисы:** `respect.service` (`apply(userId, reason, eventKey)`: таблица, потолки, суточный штраф).
**Маршруты:** нет.
```
modules/respect/
  respect.module.ts  respect.service.ts  respect.types.ts
  helpers/ respect-table.ts
```
**Сценарии:** UC-44…UC-48

## phrases
**Отвечает за:** пул фраз и ячейки, подстановку рода и переменных, выбор фразы бандитом с весами и окном без повторов, оценки, автовыключение, отчёт наполнения, перефразы через ai.
**Сущности:** [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md)
**Контроллеры:** пользователь — оценка; владелец — пул, наполнение, выключенные, перефразы.
**Зависит от:** ai (перефразы), analytics (GameSettings: имена `{other}`).
**Сервисы:** `phrases.service` (пул, отчёт наполнения); `services/phrase-picker.service.ts` (кандидаты, веса, бандит, окно k); `services/phrase-renderer.service.ts` (род, переменные); `services/phrase-rating.service.ts` (голос, автовыключение); `services/paraphrase.service.ts` (через ai, одобрение владельцем).
**Маршруты:** пользователь `POST /feed/{id}/rating`; владелец `GET/POST /owner/phrases`, `PATCH /owner/phrases/{id}`, `GET /owner/phrases/coverage`, `POST /owner/phrases/{id}/paraphrases`.
```
modules/phrases/
  phrases.module.ts  phrases.service.ts  phrases.errors.ts  phrases.types.ts
  controllers/ phrase-rating.controller.ts  owner-phrases.controller.ts
  services/ phrase-picker.service.ts  phrase-renderer.service.ts  phrase-rating.service.ts  paraphrase.service.ts
  helpers/ gender-template.ts  bandit.ts
  dto/
```
**Сценарии:** UC-49…UC-59, UC-89, UC-92

## battle
**Отвечает за:** диалог на роль, «Ответить» с добавлением сообщения, атомарный ход (резерв удара, судья, формулы, актёр, фиксация или возврат), режимы, слом и награда, откат при чтении, сжатие контекста, карточки ролей.
**Сущности:** [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Turn](entities/turn.md), [RoleCard](entities/role-card.md)
**Контроллеры:** пользователь — диалог, реплики (ход); владелец — карточки ролей.
**Зависит от:** ai, strikes, respect, phrases (onBattleStart, onBreak), users.
**Сервисы:** `battle.service` (диалог, «Ответить»); `services/turn.service.ts` (атомарный ход: резерв, судья, формулы, актёр, фиксация/возврат); `services/damage.service.ts` (чистые формулы R-97…R-105); `services/context.service.ts` (контекст актёра); `services/compression.service.ts` (воркер, сжатие); `services/turn-recovery.service.ts` (воркер, зависшие ходы); `services/role-card.service.ts`.
**Маршруты:** пользователь `GET /battle/{role}`, `POST /battle/{role}/replies` (ход, ключ повтора в `Idempotency-Key`), `POST /battle/{role}/replies-to-feed/{feedId}`; владелец `GET/PUT /owner/role-cards/{role}`.
```
modules/battle/
  battle.module.ts  battle.service.ts  battle.errors.ts  battle.types.ts
  controllers/ battle.controller.ts  owner-role-cards.controller.ts
  services/ turn.service.ts  damage.service.ts  context.service.ts  compression.service.ts  turn-recovery.service.ts  role-card.service.ts
  helpers/ defeat-decay.ts
  dto/
```
**Сценарии:** UC-45, UC-46, UC-60…UC-71

## ai
**Отвечает за:** шлюз с заменяемым провайдером и подставным для тестов; задачи: конкретность и размер, судья, актёр, сжатие, перефразы; схемы ответов, таймауты, повторы, учёт токенов и отказов, суточный лимит на пользователя.
**Сущности:** [AiCall](entities/ai-call.md), [DailyCounter](entities/daily-counter.md)
**Контроллеры:** нет.
**Зависит от:** analytics (GameSettings).
**Сервисы:** `ai.service` (методы по задачам: `checkTask`, `judge`, `act`, `summarize`, `paraphrase`); `services/provider-gateway.service.ts` (интерфейс провайдера, таймаут, повторы); `services/daily-limit.service.ts`; `services/usage-recorder.service.ts`. Провайдеры: `providers/` (реальный, подставной).
**Маршруты:** нет.
```
modules/ai/
  ai.module.ts  ai.service.ts  ai.errors.ts  ai.types.ts
  services/ provider-gateway.service.ts  daily-limit.service.ts  usage-recorder.service.ts
  providers/ ai-provider.interface.ts  real-provider.ts  fake-provider.ts
  schemas/ judge.schema.ts  specificity.schema.ts
  prompts/
```
**Сценарии:** UC-15, UC-16, UC-66, UC-68, UC-70, UC-89

## strikes
**Отвечает за:** удары: партии (покупка, ручное начисление), расход по порядку покупки, резерв и возврат на ход, списание при возврате Stars, баланс и история операций.
**Сущности:** [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md)
**Контроллеры:** пользователь — баланс и операции; владелец — баланс пользователя, начисление и возврат с причиной.
**Зависит от:** users, analytics (журнал владельца).
**Сервисы:** `strikes.service` (баланс, история, начисление); `services/spend.service.ts` (`reserve`, `commit`, `refund` для хода, расход по партиям в транзакции); `services/manual-grant.service.ts`.
**Маршруты:** пользователь `GET /me/strikes`, `GET /me/strikes/operations`; владелец `GET /owner/users/{telegramId}/strikes`, `POST /owner/users/{telegramId}/strikes`.
```
modules/strikes/
  strikes.module.ts  strikes.service.ts  strikes.errors.ts  strikes.types.ts
  controllers/ strikes.controller.ts  owner-strikes.controller.ts
  services/ spend.service.ts  manual-grant.service.ts
  dto/
```
**Сценарии:** UC-62, UC-68, UC-72…UC-77, UC-91

## payments
**Отвечает за:** пакеты и цены, создание счёта Stars, проверку `pre_checkout_query`, приём `successful_payment` ровно один раз, дозачисление, `/terms`, `/paysupport`, возврат Stars владельцем.
**Сущности:** [StarsPayment](entities/stars-payment.md), [Package](entities/package.md), [SupportTicket](entities/support-ticket.md)
**Контроллеры:** пользователь — пакеты, счёт; владелец — пакеты, обращения, возврат Stars.
**Зависит от:** strikes, users, analytics.
**Сервисы:** `payments.service` (пакеты, создание счёта); `services/stars-gateway.service.ts` (интерфейс Telegram Stars, подставной шлюз); `services/payment-processor.service.ts` (`successful_payment`: уникальный charge id, транзакция с начислением); `services/credit-retry.service.ts` (воркер: дозачисление); `services/support.service.ts` (`/paysupport`, возврат).
**Маршруты:** пользователь `GET /packages`, `POST /packages/{id}/invoice`; владелец `GET/PUT /owner/packages`, `GET /owner/support-tickets`, `POST /owner/payments/{id}/refund`.
```
modules/payments/
  payments.module.ts  payments.service.ts  payments.errors.ts  payments.types.ts
  controllers/ payments.controller.ts  owner-payments.controller.ts
  services/ payment-processor.service.ts  credit-retry.service.ts  support.service.ts
  gateways/ stars-gateway.interface.ts  telegram-stars.gateway.ts  fake-stars.gateway.ts
  dto/
```
**Сценарии:** UC-72…UC-77, UC-90, UC-94

## sharing
**Отвечает за:** карточку-изображение по шаблону (фраза пула, роль, степень победы, ссылка на бота) и подготовленное сообщение для выбора чата.
**Сущности:** нет (карточка не хранится).
**Контроллеры:** пользователь — создать карточку.
**Зависит от:** phrases, battle, tasks.
**Сервисы:** `sharing.service` (выбор фразы, сборка карточки, подготовка сообщения для выбора чата); `services/card-renderer.service.ts` (шаблон SVG в PNG).
**Маршруты:** пользователь `POST /shares` (экран «Готово», «Провал» или «Бой»).
```
modules/sharing/
  sharing.module.ts  sharing.service.ts  sharing.errors.ts
  controllers/ sharing.controller.ts
  services/ card-renderer.service.ts
  templates/ card.svg
  dto/
```
**Сценарии:** UC-78…UC-82

## leaderboard
**Отвечает за:** топ-100, своё место, участие и выход.
**Сущности:** поля [User](entities/user.md) (`closedCount`, `closedCountAt`, `inLeaderboard`)
**Контроллеры:** пользователь — рейтинг.
**Зависит от:** users.
**Сервисы:** `leaderboard.service` (топ-100, место, участие).
**Маршруты:** пользователь `GET /leaderboard`, `PUT /me/leaderboard-participation`.
```
modules/leaderboard/
  leaderboard.module.ts  leaderboard.service.ts
  controllers/ leaderboard.controller.ts
  dto/
```
**Сценарии:** UC-83…UC-88

## analytics
**Отвечает за:** события метрик без текстов (N-17), расчёт метрик за период, журнал действий владельца, настройки игры.
**Сущности:** [AnalyticsEvent](entities/analytics-event.md), [OwnerAction](entities/owner-action.md), [GameSettings](entities/game-settings.md)
**Контроллеры:** владелец — метрики, журнал, настройки игры.
**Зависит от:** ничего.
**Сервисы:** `analytics.service` (`track(event)`); `services/metrics.service.ts` (расчёт метрик за период); `services/owner-journal.service.ts`; `services/game-settings.service.ts`.
**Маршруты:** владелец `GET /owner/metrics`, `GET /owner/journal`, `GET/PUT /owner/game-settings`.
```
modules/analytics/
  analytics.module.ts  analytics.service.ts  analytics.types.ts
  controllers/ owner-analytics.controller.ts
  services/ metrics.service.ts  owner-journal.service.ts  game-settings.service.ts
  dto/
```
**Сценарии:** UC-90, UC-93
