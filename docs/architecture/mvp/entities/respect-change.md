---
entity: RespectChange
status: подтверждено
---

# RespectChange · [← сводка](../00-overview.md)

Запись изменения уважения с причиной; ключ события защищает от двойного начисления.

**Связи:** → User
**Сценарии:** UC-44…UC-48 ([привязка](../use-cases.md))
**Модуль-владелец:** [respect](../modules.md#respect)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `userId` | ref(User) | да | вычисляется | respect | нигде |
| `reason` | enum(start, done, missed_check_in, fail, give_up, battle_hit, break) | да | вычисляется | respect | нигде |
| `delta`, `applied` | decimal | да | вычисляется (applied после потолков) | respect | нигде |
| `eventKey` | string | да | вычисляется (например periodId:done) | respect | нигде |
| `localDate` | дата местная | да | вычисляется (потолок штрафов 3 в сутки) | respect | нигде |
| `at` | date | да | генерируется | respect | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- eventKey уникален на пользователя
