---
feature: mvp
status: подтверждено   # набросок | детализация | подтверждено
date: 2026-10-23
---

# Батя, MVP · статус: подтверждено · 2026-10-23

Telegram-бот и Mini App: NestJS API и воркер в одной кодовой базе, MongoDB, ИИ и Stars за заменяемыми шлюзами. [ТЗ](../../specs/mvp/spec.md)

Процессы: `api` (HTTP Mini App и вебхук бота) и `worker` (расписание, отправка, восстановление ходов и платежей) — [A1](decisions.md#a1).

## Сценарии
| id | кто | что делает | модули |
|---|---|---|---|
| [UC-1…12](use-cases.md#f-1-f-2) | гость, пользователь | старт, настройки, удаление аккаунта | users, bot, phrases |
| [UC-13…31](use-cases.md#f-3-f-5) | пользователь | ставит и закрывает задачи, периоды | tasks, ai, respect, pressure |
| [UC-32…43](use-cases.md#f-6-f-7) | пользователь | получает проверки, напоминания, onFail, onAbsent | pressure, delivery, phrases |
| [UC-44…59](use-cases.md#f-8-f-10) | пользователь | уважение, фразы, оценки, «История» | respect, phrases, delivery |
| [UC-60…71](use-cases.md#f-11-f-12) | пользователь | ведёт бой, ломает персонажа | battle, ai, strikes, respect |
| [UC-72…77](use-cases.md#f-13) | пользователь, владелец | покупает удары за Stars, возвраты | payments, strikes, bot |
| [UC-78…88](use-cases.md#f-14-f-15) | пользователь | делится карточкой, смотрит рейтинг | sharing, leaderboard |
| [UC-89…94](use-cases.md#f-16) | владелец | пул, карточки ролей, цены, удары, метрики | phrases, battle, payments, analytics |

## Модули
| модуль | отвечает за | сущности | контроллеры |
|---|---|---|---|
| [users](modules.md#users) | профиль, настройки, вход по initData, удаление | User, DeletedUser | пользователь, владелец |
| [bot](modules.md#bot) | вебхук Telegram: команды, кнопки, оплата | — | вебхук |
| [tasks](modules.md#tasks) | задачи, периоды, статусы, настроение, проверка конкретности | Task, Period | пользователь |
| [pressure](modules.md#pressure) | план проверок, серий, напоминаний, onFail, onAbsent | OutboxMessage | — (воркер) |
| [delivery](modules.md#delivery) | отправка: тихие часы, 3 минуты, приоритеты, лимиты Telegram | OutboxMessage, FeedMessage | пользователь («История») |
| [respect](modules.md#respect) | шкала уважения, потолки и суточный лимит штрафов | RespectChange | — |
| [phrases](modules.md#phrases) | пул, подстановка, бандит, оценки, автовыключение | Phrase, PhraseVote, PhraseShowState | пользователь, владелец |
| [battle](modules.md#battle) | диалог, атомарный ход, побеждённость, слом, сжатие | BattleDialog, BattleMessage, Turn, RoleCard | пользователь, владелец |
| [ai](modules.md#ai) | шлюз провайдеров ИИ, лимиты, учёт токенов | AiCall, DailyCounter | — |
| [strikes](modules.md#strikes) | удары: партии, расход по порядку, операции | StrikeLot, StrikeOperation | пользователь, владелец |
| [payments](modules.md#payments) | пакеты, счета Stars, ровно одно начисление, /paysupport | StarsPayment, Package, SupportTicket | пользователь, владелец |
| [sharing](modules.md#sharing) | карточка-изображение, отправка в чат | — | пользователь |
| [leaderboard](modules.md#leaderboard) | топ-100, своё место, участие | поля User | пользователь |
| [analytics](modules.md#analytics) | события, метрики, журнал владельца, настройки игры | AnalyticsEvent, OwnerAction, GameSettings | владелец |

Логика и база расходятся: разовая задача хранится как Task с одним Period ([A4](decisions.md#a4)); уважение — поле User плюс журнал RespectChange; баланс — сумма остатков StrikeLot.

## Сущности
| сущность | суть | связи | в API |
|---|---|---|---|
| [User](entities/user.md), [DeletedUser](entities/deleted-user.md) | профиль, настройки, уважение, счётчик рейтинга; след удалённого | ← всё пользовательское | владельцу записи |
| [Task](entities/task.md), [Period](entities/period.md) | задача и её периоды со сроком и статусом | Task → User, Period → Task | владельцу |
| [OutboxMessage](entities/outbox-message.md) | запланированное сообщение персонажа | → User, Period | нигде |
| [FeedMessage](entities/feed-message.md) | отправленное сообщение: «История», проверка, оценка | → User, Phrase, Period | владельцу |
| [RespectChange](entities/respect-change.md) | изменение уважения с причиной | → User | нигде |
| [Phrase](entities/phrase.md), [PhraseVote](entities/phrase-vote.md), [PhraseShowState](entities/phrase-show-state.md) | фраза пула со статистикой, голос, недавние показы | Vote → Phrase, User | текст всем, статистика админу |
| [BattleDialog](entities/battle-dialog.md), [BattleMessage](entities/battle-message.md), [Turn](entities/turn.md) | диалог на роль, реплики, ход | → User; Turn → StrikeOperation | владельцу |
| [RoleCard](entities/role-card.md), [GameSettings](entities/game-settings.md) | карточка роли; коэффициенты, лимиты, имена `{other}` | — | админу |
| [StrikeLot](entities/strike-lot.md), [StrikeOperation](entities/strike-operation.md) | партия ударов и операция по ней | → User, StarsPayment | владельцу, админу |
| [StarsPayment](entities/stars-payment.md), [Package](entities/package.md), [SupportTicket](entities/support-ticket.md) | платёж Stars, пакет, обращение | Payment → Package, User | владельцу, админу |
| [AiCall](entities/ai-call.md), [DailyCounter](entities/daily-counter.md) | вызов ИИ с токенами; суточный счётчик | → User, Turn | нигде |
| [AnalyticsEvent](entities/analytics-event.md), [OwnerAction](entities/owner-action.md) | событие метрик; действие владельца | → User | админу |

## Внешние сервисы
| сервис | зачем | риск |
|---|---|---|
| [Telegram Bot API](integrations.md#telegram-bot-api) | сообщения, кнопки, initData, шеринг | ⚠ лимиты рассылки, блокировка бота |
| [Telegram Stars](integrations.md#telegram-stars) | оплата ударов, возвраты | ⚠ вывод из Беларуси (Q-1 ТЗ) |
| [Провайдер ИИ](integrations.md#провайдер-ии) | судья, актёр, сжатие, конкретность, перефразы | ⚠ отказы и цена (Q-2 ТЗ) |

## ⚠ Узкие места и решения Никиты
| # | что | рекомендация |
|---|---|---|
| ⚠1 | ход боя: два вызова ИИ до 30 с, транзакцию не удержать | резерв удара, фиксация или возврат, зависшие ходы чинит воркер |
| ⚠2 | расписание: пояса, тихие часы, 3 минуты, приоритеты, слияния | один диспетчер на пользователя в delivery, фраза выбирается при отправке |
| ⚠3 | Stars: начислить ровно один раз | уникальный charge id, транзакция, дозачисление воркером |
| ⚠4 | транзакции MongoDB | только replica set, в том числе локально ([A3](decisions.md#a3)) |
| [Q1…Q5](decisions.md#принято) | функции владельца, лёгкая модель, очередь, карточка, хостинг | приняты по рекомендациям ([D1](decisions.md#принято)) |
