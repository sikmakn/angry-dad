---
entity: OutboxMessage
status: подтверждено
---

# OutboxMessage · [← сводка](../00-overview.md)

Запланированное сообщение персонажа; диспетчер отправляет его или отменяет.

**Связи:** → User, Period
**Сценарии:** UC-32…UC-43 ([привязка](../use-cases.md))
**Модуль-владелец:** [delivery](../modules.md#delivery) (исполняет), pressure (планирует)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `id` | id | да | генерируется | система | нигде |
| `userId`, `periodId` | ref | да / нет | вычисляется | pressure | нигде |
| `kind` | enum(check_in, series_check_in, reminder, fail, absent, check_in_missed) | да | вычисляется | pressure | нигде |
| `priority` | int | да | вычисляется (просрочка > напоминание > onAbsent > проверка) | pressure | нигде |
| `dueAt` | date | да | вычисляется | pressure, delivery (сдвиг) | нигде |
| `originalDueAt` | date | да | копия-снимок dueAt (сдвиг больше 15 мин отменяет) | pressure | нигде |
| `status` | enum(planned, leased, sent, cancelled, dropped) | да | вычисляется | delivery | нигде |
| `leaseUntil` | date | нет | вычисляется (аренда воркером) | delivery | нигде |
| `dedupeKey` | string | да | вычисляется (слияние одного типа по задаче) | pressure | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- одна запись с данным dedupeKey в статусе planned
- отправка не раньше lastSentAt + 3 мин

## Статусы и переходы
| из | событие | в |
|---|---|---|
| — | планирование | planned |
| planned | воркер взял в аренду | leased |
| leased | отправлено | sent |
| planned, leased | закрытие задачи, тихие часы для проверки, сдвиг > 15 мин | cancelled |
| planned | опоздание > 15 мин (кроме первого onFail) | dropped |
| leased | аренда истекла | planned |
