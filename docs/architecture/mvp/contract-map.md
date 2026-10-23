# Карта контракта · [← сводка](00-overview.md)

Контракт: [`docs/openapi.yaml`](../../openapi.yaml), 51 операция, 11 тегов по модулям. Решения и допущения шага — [decisions.md, раздел «Контракт»](decisions.md#контракт).

Аудитория: **пользователь** (`Authorization: tma <initData>`, большинство операций требует завершённый старт), **гость** (`getMe`, `completeOnboarding`, `deleteMe`), **владелец** (`/owner/*`, тот же вход плюс проверка Telegram ID), **Telegram** (вебхук, секретный токен).

## Сценарии → операции

| сценарии | операции | экраны и состояния | примечание |
|---|---|---|---|
| UC-1…UC-3, UC-5 (старт) | `getMe`, `completeOnboarding` | выбор родителя и пола, «Соболезнуем», первая фраза; гость на незавершённом экране | `/start` и `onGreeting` идут через `receiveTelegramUpdate`; UC-2 «Снова начинаем» приходит в `replies` |
| UC-4, UC-6 | `getMe`, `updateMe`, `receiveTelegramUpdate` | «Обновить часовой пояс?» | сравнение пояса делает клиент |
| UC-7…UC-9 | `getMe`, `updateMe`, `setLeaderboardParticipation` | «Настройки», ошибка «Тихие часы не длиннее 12 часов» | 400 `validation_failed` |
| UC-10…UC-12 | `getMyStrikes`, `deleteMe` | два подтверждения, «N ударов сгорят» | число ударов берётся из `getMyStrikes` |
| UC-13…UC-18 | `createTask`, `listTasks`, `getTask` | форма постановки, отказы: `task_vague`, `deadline_out_of_range`, `ai_unavailable`, `daily_limit_reached` | проверка размера в том же вызове |
| UC-19…UC-25 | `listTasks`, `getTask`, `completePeriod`, `extendPeriod`, `surrenderPeriod`, `retryPeriod`, `updateTask`, `deleteTask` | главная, «Готово», «Провал», продление, «Сделаю за час», удаление | кнопки в боте идут через `receiveTelegramUpdate` |
| UC-26…UC-31 | `createTask`, `listTaskPeriods`, `completePeriod`, `updateTask` (остановка), `getTask` | периоды повторяющейся задачи, остановка | настроение считает клиент по `moodFrom`, `anchorAt`, `deadline` |
| UC-32…UC-37 | `listFeed`, `answerCheckIn`, `receiveTelegramUpdate` | проверка на странице задачи (три кнопки), «Задача уже закрыта» (409 `period_not_active`) | отправка по расписанию — воркер, в контракте её нет |
| UC-38…UC-43 | `receiveTelegramUpdate`, `listFeed` | напоминания, onFail, onAbsent, тихие часы | в HTTP только кнопки под сообщениями и «История» |
| UC-44…UC-48 | `getMe`, `PeriodActionResponse.respect`, `TurnResponse.respectDelta` | «Уважение» на главной, «Готово», «Провал», «Бой» | отдельной операции нет |
| UC-49…UC-53 | `listFeed` | показ фраз | выбор и подстановка — на сервере |
| UC-54…UC-59 | `rateFeedMessage`, `listFeed`, `receiveTelegramUpdate` | «История», оценки, «Уже оценено» | 409 `already_rated` |
| UC-60…UC-65 | `getBattleDialog`, `listBattleMessages`, `createBattleQuote`, `getMyStrikes` | «Бой», «Ответить», пустой диалог, нулевой баланс | |
| UC-66…UC-71 | `createBattleMessage`, `getBattleDialog`, `getMyStrikes` | ход, слом, ошибка хода | 502 `turn_failed`, 409 `insufficient_strikes` и `turn_in_progress`, `Idempotency-Key` |
| UC-70, UC-71, UC-90 (карточки) | `getOwnerRoleCard`, `replaceOwnerRoleCard` | раздел владельца | |
| UC-72…UC-77 | `listPackages`, `createInvoice`, `getMyStrikes`, `listMyStrikeOperations`, `receiveTelegramUpdate` | магазин, окно оплаты, баланс, история | `pre_checkout_query` и `successful_payment` идут только через вебхук |
| UC-78…UC-82 | `createShare` | «Поделиться», «Не получилось, ещё раз?» | 503 `share_failed` |
| UC-83…UC-88 | `getLeaderboard`, `setLeaderboardParticipation` | «Рейтинг», своя карточка, место под таблицей | |
| UC-89, UC-92 | `listOwnerPhrases`, `createOwnerPhrase`, `updateOwnerPhrase`, `createOwnerParaphrases`, `getOwnerPhraseCoverage` | пул, выключенные, перефразы, «В ячейке не останется фраз» | 409 `last_enabled_phrase` |
| UC-90, UC-93 | `getOwnerMetrics`, `listOwnerJournal`, `getOwnerGameSettings`, `replaceOwnerGameSettings`, `listOwnerPackages`, `replaceOwnerPackage` | метрики, журнал, цены | |
| UC-91, UC-94 | `getOwnerUser`, `getOwnerUserStrikes`, `listOwnerUserStrikeOperations`, `createOwnerStrikeOperation`, `listOwnerPayments`, `refundOwnerPayment`, `listOwnerSupportTickets`, `updateOwnerSupportTicket` | баланс пользователя, начисление, возврат Stars, обращения | «Укажите причину» — 400 |

## Ресурсы API → сущности

| ресурс API | сущность | поля, скрытые от клиента | модуль |
|---|---|---|---|
| `/me` | User | `telegramId` (только владельцу продукта), `respectFromBreak`, `lastBreakRewardAt`, `lastActivityAt`, `botBlocked`, `lastSentAt` | users |
| `/tasks`, `/tasks/{id}` | Task, Period (вложен текущий) | `userId`, `deletedAt`, `currentPeriodId` (заменён вложенным периодом) | tasks |
| `/tasks/{id}/periods` | Period | `taskId`, `userId`, `lastExtendedOn`, `series`, `nextCheckInAt` | tasks |
| `/periods/{id}/…` (5 действий) | Period, User.respect | то же | tasks |
| `/feed`, `/feed/{id}/rating`, `/feed/{id}/check-in-answer` | FeedMessage, PhraseVote | `userId`, `phraseId`, `telegramMessageId` | delivery, phrases |
| `/battle/{role}`, `/messages`, `/quotes` | BattleDialog, BattleMessage, Turn | `userId`, `brokenArmed`, `defeatAtLastTurn`, `summary`, `summaryUpTo`, `activeTurnId`, `dialogId`, `turnId`, `judge`, `failReason`, `clientTurnId` (приходит заголовком) | battle |
| `/me/strikes`, `/me/strike-operations` | StrikeLot, StrikeOperation | `userId`, `paymentId`, `lotId`, `turnId`, `refundedAt` (только владельцу продукта) | strikes |
| `/packages`, `/packages/{id}/invoices` | Package, StarsPayment | `active`, `order` (только владельцу продукта), `invoicePayload` | payments |
| `/shares` | — (карточка не хранится) | — | sharing |
| `/leaderboard`, `/me/leaderboard-participation` | поля User | всё, кроме `username`, `firstName`, `closedCount`, `inLeaderboard` | leaderboard |
| `/owner/users/{telegramId}` и вложенные | User, StrikeLot, StrikeOperation | всё пользовательское: задачи, диалоги, профиль | users, strikes |
| `/owner/phrases`, `/phrase-coverage` | Phrase | — (владелец видит все поля) | phrases |
| `/owner/role-cards/{role}` | RoleCard | `version` | battle |
| `/owner/packages`, `/payments`, `/support-tickets` | Package, StarsPayment, SupportTicket | `invoicePayload`, `userId` | payments |
| `/owner/metrics`, `/journal`, `/game-settings` | AnalyticsEvent (агрегаты), OwnerAction, GameSettings | сырые события | analytics |
| `/telegram/webhook` | — | — | bot |

Не попадают в API целиком: OutboxMessage, RespectChange, AiCall, DailyCounter, PhraseShowState, DeletedUser, AnalyticsEvent (по каталогу «нигде»).

## ⚠ Допущения и вопросы

Подробности, номера и варианты — в [decisions.md, раздел «Контракт»](decisions.md#контракт): К1–К10 допущения, КВ1–КВ5 вопросы архитектору и Никите.
