---
entity: Task
status: подтверждено
---

# Task · [← сводка](../00-overview.md)

Задача пользователя: разовая (один Period) или повторяющаяся (много Period).

**Связи:** → User; ← Period
**Сценарии:** UC-13…UC-31 ([привязка](../use-cases.md))
**Модуль-владелец:** [tasks](../modules.md#tasks)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `id` | id | да | генерируется | система | владельцу |
| `userId` | ref(User) | да | вычисляется из входа | tasks | нигде |
| `title` | string | да | ввод пользователя | tasks | владельцу |
| `kind` | enum(one_time, recurring) | да | ввод пользователя | tasks | владельцу |
| `size` | enum(micro, medium, large) | да | внешний сервис (лёгкая модель) | tasks | владельцу |
| `recurrence` | {type: daily, weekdays, weekly, days_of_week, every_n_days; days; n} | для recurring | ввод пользователя | tasks | владельцу |
| `anchorTime` | время суток | нет | ввод пользователя (ориентир) | tasks | владельцу |
| `status` | enum(active, stopped, closed) | да | вычисляется | tasks | владельцу |
| `currentPeriodId` | ref(Period) | нет | вычисляется (чтение главной одним запросом) | tasks | владельцу |
| `createdAt`, `deletedAt` | date | да / нет | генерируется | tasks | владельцу / нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- у recurring одновременно не больше одного active Period
- удалённая задача не видна и не считается в рейтинге

## Статусы и переходы
| из | событие | в |
|---|---|---|
| — | постановка | active |
| active (recurring) | «Остановить задачу» | stopped |
| active (one_time) | период стал done или failed | closed |

Удаление ставит `deletedAt`, физически запись стирается при удалении аккаунта.
