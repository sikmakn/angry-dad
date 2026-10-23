---
entity: Period
status: подтверждено
---

# Period · [← сводка](../00-overview.md)

Один срок задачи со статусом; у разовой задачи единственный (A4).

**Связи:** → Task, User; ← OutboxMessage, FeedMessage
**Сценарии:** UC-19…UC-37 ([привязка](../use-cases.md))
**Модуль-владелец:** [tasks](../modules.md#tasks)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `id` | id | да | генерируется | система | владельцу |
| `taskId`, `userId` | ref(Task), ref(User) | да | вычисляется | tasks | нигде |
| `startsAt`, `moodFrom` | date | да | вычисляется (00:00 первого дня, конец тихих часов) | tasks | владельцу |
| `deadline` | date | да | ввод (разовая) или вычисляется (период) | tasks | владельцу |
| `anchorAt` | date | нет | вычисляется из ориентира | tasks | владельцу |
| `status` | enum(active, done, failed) | да | вычисляется | tasks | владельцу |
| `closedAt`, `closedBy` | date, enum(done_button, check_in, deadline, give_up) | нет | вычисляется | tasks | владельцу |
| `lastExtendedOn` | дата местная | нет | вычисляется (продление раз в сутки) | tasks | нигде |
| `retryUsed` | bool | да | вычисляется («Сделаю за час» один раз) | tasks | владельцу |
| `series` | {id, startedAt, endsAt, penalized} | нет | вычисляется (R-50, A-63) | pressure | нигде |
| `nextCheckInAt` | date | нет | вычисляется (случайное расписание) | pressure | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- переходы: active → done | failed; failed → active только retry, один раз
- новый срок не позже начала следующего периода

## Статусы и переходы
| из | событие | в |
|---|---|---|
| — | открытие периода (создание задачи, 00:00 первого дня) | active |
| active | «Готово» / «Сделано» | done |
| active | наступил срок, «Сдаюсь» | failed |
| failed | «Сделаю за час» (`retryUsed` = нет, следующий период не начался) | active |

Каждый переход делает `periods.service` в одной транзакции с `RespectChange` и отменой записей `OutboxMessage` (кроме onFail).
