---
entity: User
status: подтверждено
---

# User · [← сводка](../00-overview.md)

Пользователь бота: профиль, настройки, уважение, счётчик рейтинга.

**Связи:** ← Task, BattleDialog, StrikeLot, FeedMessage и всё пользовательское
**Сценарии:** UC-1…UC-12, UC-44, UC-83…UC-88 ([привязка](../use-cases.md))
**Модуль-владелец:** [users](../modules.md#users)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `id` | id | да | генерируется | система | владельцу |
| `telegramId` | int | да | внешний сервис (initData, вебхук) | users | админу |
| `username`, `firstName` | string | нет | внешний сервис, обновляется при входе | users | всем (в рейтинге) |
| `onboarding` | enum(guest, done) | да | вычисляется по шагам старта | users | владельцу |
| `role` | enum(father, mother) | после старта | ввод пользователя | users | владельцу |
| `gender` | enum(male, female) | после старта | ввод пользователя | users | владельцу |
| `timeZone` | string (IANA) | да | устройство или ввод, по умолчанию Europe/Moscow | users | владельцу |
| `quietHours` | {start, end} в минутах суток | да | ввод, по умолчанию 23:00–08:00 | users | владельцу |
| `respect` | decimal (шаг 0.5) | да | вычисляется, старт 12 | respect | владельцу |
| `respectFromBreak` | bool | да | вычисляется: значение выше 94 получено сломом | respect | нигде |
| `lastBreakRewardAt` | date | нет | вычисляется (+12 не чаще 3 суток на пользователя) | battle | нигде |
| `inLeaderboard` | bool | да | ввод, по умолчанию да | users | владельцу |
| `closedCount`, `closedCountAt` | int, date | да | вычисляется при done и удалении | tasks | всем (в рейтинге) |
| `lastActivityAt` | date | да | вычисляется (активность A-26) | users | нигде |
| `botBlocked` | bool | да | внешний сервис (my_chat_member, 403) | delivery | нигде |
| `lastSentAt` | date | нет | вычисляется (интервал 3 минуты) | delivery | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- respect в [0; 100]; выше 94 только если respectFromBreak
- гость (onboarding = guest) не получает сообщений по расписанию
- telegramId уникален

## Индексы
`telegramId` (уникальный); (`inLeaderboard`, `closedCount` по убыванию, `closedCountAt` по возрастанию) для рейтинга.
