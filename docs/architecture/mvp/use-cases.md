# Сценарии и модули · [← сводка](00-overview.md)

Описание сценариев лежит в ТЗ: `docs/specs/mvp/functions/`. Здесь только привязка к модулям и сущностям. Сценариев без модуля или сущности нет.

<a id="f-1-f-2"></a>
## F-1, F-2: старт и настройки

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-1"></a>UC-1 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-1) |
| <a id="uc-2"></a>UC-2 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-2) |
| <a id="uc-3"></a>UC-3 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-3) |
| <a id="uc-4"></a>UC-4 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-4) |
| <a id="uc-5"></a>UC-5 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-5) |
| <a id="uc-6"></a>UC-6 | F-1 | users, bot, phrases | [User](entities/user.md), [DeletedUser](entities/deleted-user.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-1-start.md#uc-6) |
| <a id="uc-7"></a>UC-7 | F-2 | users, strikes, leaderboard | [User](entities/user.md), [StrikeLot](entities/strike-lot.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-7) |
| <a id="uc-8"></a>UC-8 | F-2 | users, strikes, leaderboard | [User](entities/user.md), [StrikeLot](entities/strike-lot.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-8) |
| <a id="uc-9"></a>UC-9 | F-2 | users, strikes, leaderboard | [User](entities/user.md), [StrikeLot](entities/strike-lot.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-9) |
| <a id="uc-10"></a>UC-10 | F-2 | users, strikes, leaderboard | [User](entities/user.md), [StrikeLot](entities/strike-lot.md), [DeletedUser](entities/deleted-user.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-10) |
| <a id="uc-11"></a>UC-11 | F-2 | users, analytics | [User](entities/user.md), [StarsPayment](entities/stars-payment.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-11) |
| <a id="uc-12"></a>UC-12 | F-2 | users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-2-settings.md#uc-12) |

<a id="f-3-f-5"></a>
## F-3…F-5: задачи и периоды

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-13"></a>UC-13 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-13) |
| <a id="uc-14"></a>UC-14 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-14) |
| <a id="uc-15"></a>UC-15 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-15) |
| <a id="uc-16"></a>UC-16 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-16) |
| <a id="uc-17"></a>UC-17 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-17) |
| <a id="uc-18"></a>UC-18 | F-3 | tasks, ai, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-3-task-create.md#uc-18) |
| <a id="uc-19"></a>UC-19 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-19) |
| <a id="uc-20"></a>UC-20 | F-4 | tasks, ai, pressure, phrases, leaderboard | [Task](entities/task.md), [Period](entities/period.md), [DailyCounter](entities/daily-counter.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-20) |
| <a id="uc-21"></a>UC-21 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-21) |
| <a id="uc-22"></a>UC-22 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-22) |
| <a id="uc-23"></a>UC-23 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-23) |
| <a id="uc-24"></a>UC-24 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-24) |
| <a id="uc-25"></a>UC-25 | F-4 | tasks, respect, pressure, phrases | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-4-one-time-task.md#uc-25) |
| <a id="uc-26"></a>UC-26 | F-5 | tasks, respect, pressure | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-26) |
| <a id="uc-27"></a>UC-27 | F-5 | tasks, respect, pressure | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-27) |
| <a id="uc-28"></a>UC-28 | F-5 | tasks, respect, pressure | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-28) |
| <a id="uc-29"></a>UC-29 | F-5 | tasks, respect, pressure | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-29) |
| <a id="uc-30"></a>UC-30 | F-5 | tasks, respect, pressure | [Task](entities/task.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md), [OutboxMessage](entities/outbox-message.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-30) |
| <a id="uc-31"></a>UC-31 | F-5 | tasks, pressure | [Task](entities/task.md), [Period](entities/period.md) | [ТЗ](../../specs/mvp/functions/F-5-recurring-task.md#uc-31) |

<a id="f-6-f-7"></a>
## F-6, F-7: проверки и уведомления

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-32"></a>UC-32 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-32) |
| <a id="uc-33"></a>UC-33 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-33) |
| <a id="uc-34"></a>UC-34 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-34) |
| <a id="uc-35"></a>UC-35 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-35) |
| <a id="uc-36"></a>UC-36 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-36) |
| <a id="uc-37"></a>UC-37 | F-6 | pressure, delivery, tasks, respect, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [Period](entities/period.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-6-check-ins.md#uc-37) |
| <a id="uc-38"></a>UC-38 | F-7 | pressure, delivery, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-38) |
| <a id="uc-39"></a>UC-39 | F-7 | pressure, delivery, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-39) |
| <a id="uc-40"></a>UC-40 | F-7 | delivery, bot, users, tasks | [OutboxMessage](entities/outbox-message.md), [User](entities/user.md), [AnalyticsEvent](entities/analytics-event.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-40) |
| <a id="uc-41"></a>UC-41 | F-7 | pressure, delivery, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-41) |
| <a id="uc-42"></a>UC-42 | F-7 | pressure, delivery, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-42) |
| <a id="uc-43"></a>UC-43 | F-7 | pressure, delivery, bot | [OutboxMessage](entities/outbox-message.md), [FeedMessage](entities/feed-message.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-7-notifications.md#uc-43) |

<a id="f-8-f-10"></a>
## F-8…F-10: уважение и фразы

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-44"></a>UC-44 | F-8 | respect, tasks, battle | [RespectChange](entities/respect-change.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-8-respect.md#uc-44) |
| <a id="uc-45"></a>UC-45 | F-8 | respect, battle | [RespectChange](entities/respect-change.md), [User](entities/user.md), [Turn](entities/turn.md) | [ТЗ](../../specs/mvp/functions/F-8-respect.md#uc-45) |
| <a id="uc-46"></a>UC-46 | F-8 | respect, battle, strikes | [RespectChange](entities/respect-change.md), [Turn](entities/turn.md), [StrikeOperation](entities/strike-operation.md) | [ТЗ](../../specs/mvp/functions/F-8-respect.md#uc-46) |
| <a id="uc-47"></a>UC-47 | F-8 | respect, tasks, battle | [RespectChange](entities/respect-change.md), [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-8-respect.md#uc-47) |
| <a id="uc-48"></a>UC-48 | F-8 | respect, users | [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-8-respect.md#uc-48) |
| <a id="uc-49"></a>UC-49 | F-9 | phrases, delivery | [Phrase](entities/phrase.md), [PhraseShowState](entities/phrase-show-state.md), [GameSettings](entities/game-settings.md) | [ТЗ](../../specs/mvp/functions/F-9-phrase-pool.md#uc-49) |
| <a id="uc-50"></a>UC-50 | F-9 | phrases, delivery | [Phrase](entities/phrase.md), [PhraseShowState](entities/phrase-show-state.md), [GameSettings](entities/game-settings.md) | [ТЗ](../../specs/mvp/functions/F-9-phrase-pool.md#uc-50) |
| <a id="uc-51"></a>UC-51 | F-9 | phrases, delivery | [Phrase](entities/phrase.md), [PhraseShowState](entities/phrase-show-state.md), [GameSettings](entities/game-settings.md) | [ТЗ](../../specs/mvp/functions/F-9-phrase-pool.md#uc-51) |
| <a id="uc-52"></a>UC-52 | F-9 | phrases, delivery | [Phrase](entities/phrase.md), [PhraseShowState](entities/phrase-show-state.md), [GameSettings](entities/game-settings.md) | [ТЗ](../../specs/mvp/functions/F-9-phrase-pool.md#uc-52) |
| <a id="uc-53"></a>UC-53 | F-9 | phrases, delivery | [Phrase](entities/phrase.md), [PhraseShowState](entities/phrase-show-state.md), [GameSettings](entities/game-settings.md) | [ТЗ](../../specs/mvp/functions/F-9-phrase-pool.md#uc-53) |
| <a id="uc-54"></a>UC-54 | F-10 | phrases, delivery, bot | [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-54) |
| <a id="uc-55"></a>UC-55 | F-10 | phrases, delivery, battle | [PhraseVote](entities/phrase-vote.md), [FeedMessage](entities/feed-message.md), [BattleMessage](entities/battle-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-55) |
| <a id="uc-56"></a>UC-56 | F-10 | phrases, delivery, bot | [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-56) |
| <a id="uc-57"></a>UC-57 | F-10 | phrases, delivery, bot | [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-57) |
| <a id="uc-58"></a>UC-58 | F-10 | phrases, delivery, bot | [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-58) |
| <a id="uc-59"></a>UC-59 | F-10 | phrases, delivery, bot | [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-10-phrase-rating.md#uc-59) |

<a id="f-11-f-12"></a>
## F-11, F-12: бой

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-60"></a>UC-60 | F-11 | battle, delivery | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-60) |
| <a id="uc-61"></a>UC-61 | F-11 | battle, delivery, tasks | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [FeedMessage](entities/feed-message.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-61) |
| <a id="uc-62"></a>UC-62 | F-11 | battle, strikes | [BattleDialog](entities/battle-dialog.md), [StrikeLot](entities/strike-lot.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-62) |
| <a id="uc-63"></a>UC-63 | F-11 | battle, ai | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-63) |
| <a id="uc-64"></a>UC-64 | F-11 | battle, users | [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-64) |
| <a id="uc-65"></a>UC-65 | F-11 | battle, phrases | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-11-battle-dialog.md#uc-65) |
| <a id="uc-66"></a>UC-66 | F-12 | battle, ai, strikes, respect | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Turn](entities/turn.md), [RoleCard](entities/role-card.md), [StrikeOperation](entities/strike-operation.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-66) |
| <a id="uc-67"></a>UC-67 | F-12 | battle, ai, strikes, respect | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Turn](entities/turn.md), [RoleCard](entities/role-card.md), [StrikeOperation](entities/strike-operation.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-67) |
| <a id="uc-68"></a>UC-68 | F-12 | battle, ai, strikes, respect | [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Turn](entities/turn.md), [RoleCard](entities/role-card.md), [StrikeOperation](entities/strike-operation.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-68) |
| <a id="uc-69"></a>UC-69 | F-12 | battle, strikes, respect | [Turn](entities/turn.md), [BattleDialog](entities/battle-dialog.md), [StrikeOperation](entities/strike-operation.md), [RespectChange](entities/respect-change.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-69) |
| <a id="uc-70"></a>UC-70 | F-12 | battle, ai | [RoleCard](entities/role-card.md), [Turn](entities/turn.md), [AiCall](entities/ai-call.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-70) |
| <a id="uc-71"></a>UC-71 | F-12 | battle, phrases | [BattleDialog](entities/battle-dialog.md), [RoleCard](entities/role-card.md) | [ТЗ](../../specs/mvp/functions/F-12-battle-turn.md#uc-71) |

<a id="f-13"></a>
## F-13: удары и Stars

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-72"></a>UC-72 | F-13 | payments, strikes, bot | [StarsPayment](entities/stars-payment.md), [Package](entities/package.md), [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md), [SupportTicket](entities/support-ticket.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-72) |
| <a id="uc-73"></a>UC-73 | F-13 | payments, strikes, battle | [StarsPayment](entities/stars-payment.md), [StrikeLot](entities/strike-lot.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-73) |
| <a id="uc-74"></a>UC-74 | F-13 | payments, strikes, bot | [StarsPayment](entities/stars-payment.md), [Package](entities/package.md), [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md), [SupportTicket](entities/support-ticket.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-74) |
| <a id="uc-75"></a>UC-75 | F-13 | payments, strikes, bot | [StarsPayment](entities/stars-payment.md), [Package](entities/package.md), [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md), [SupportTicket](entities/support-ticket.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-75) |
| <a id="uc-76"></a>UC-76 | F-13 | strikes, analytics | [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md), [OwnerAction](entities/owner-action.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-76) |
| <a id="uc-77"></a>UC-77 | F-13 | strikes, payments | [StrikeOperation](entities/strike-operation.md), [Package](entities/package.md) | [ТЗ](../../specs/mvp/functions/F-13-payments.md#uc-77) |

<a id="f-14-f-15"></a>
## F-14, F-15: шеринг и рейтинг

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-78"></a>UC-78 | F-14 | sharing, phrases, battle | [Phrase](entities/phrase.md), [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-14-sharing.md#uc-78) |
| <a id="uc-79"></a>UC-79 | F-14 | sharing, phrases, battle | [Phrase](entities/phrase.md), [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-14-sharing.md#uc-79) |
| <a id="uc-80"></a>UC-80 | F-14 | sharing, phrases, battle | [Phrase](entities/phrase.md), [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-14-sharing.md#uc-80) |
| <a id="uc-81"></a>UC-81 | F-14 | sharing, phrases, battle | [Phrase](entities/phrase.md), [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-14-sharing.md#uc-81) |
| <a id="uc-82"></a>UC-82 | F-14 | sharing, phrases, battle | [Phrase](entities/phrase.md), [BattleDialog](entities/battle-dialog.md) | [ТЗ](../../specs/mvp/functions/F-14-sharing.md#uc-82) |
| <a id="uc-83"></a>UC-83 | F-15 | leaderboard, users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-83) |
| <a id="uc-84"></a>UC-84 | F-15 | leaderboard, users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-84) |
| <a id="uc-85"></a>UC-85 | F-15 | leaderboard, users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-85) |
| <a id="uc-86"></a>UC-86 | F-15 | leaderboard, tasks | [User](entities/user.md), [Task](entities/task.md), [Period](entities/period.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-86) |
| <a id="uc-87"></a>UC-87 | F-15 | leaderboard, users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-87) |
| <a id="uc-88"></a>UC-88 | F-15 | leaderboard, users | [User](entities/user.md) | [ТЗ](../../specs/mvp/functions/F-15-leaderboard.md#uc-88) |

<a id="f-16"></a>
## F-16: владелец

| сценарий | функция | модули | сущности | ссылка |
|---|---|---|---|---|
| <a id="uc-89"></a>UC-89 | F-16 | phrases, ai, analytics | [Phrase](entities/phrase.md), [AiCall](entities/ai-call.md), [OwnerAction](entities/owner-action.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-89) |
| <a id="uc-90"></a>UC-90 | F-16 | phrases, payments, analytics | [Phrase](entities/phrase.md), [Package](entities/package.md), [AnalyticsEvent](entities/analytics-event.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-90) |
| <a id="uc-91"></a>UC-91 | F-16 | strikes, analytics | [StrikeOperation](entities/strike-operation.md), [OwnerAction](entities/owner-action.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-91) |
| <a id="uc-92"></a>UC-92 | F-16 | phrases | [Phrase](entities/phrase.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-92) |
| <a id="uc-93"></a>UC-93 | F-16 | users, analytics, strikes | [OwnerAction](entities/owner-action.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-93) |
| <a id="uc-94"></a>UC-94 | F-16 | phrases, payments | [Phrase](entities/phrase.md), [SupportTicket](entities/support-ticket.md) | [ТЗ](../../specs/mvp/functions/F-16-owner.md#uc-94) |
