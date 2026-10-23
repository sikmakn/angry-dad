---
entity: SupportTicket
status: подтверждено
---

# SupportTicket · [← сводка](../00-overview.md)

Обращение /paysupport для владельца.

**Связи:** → User
**Сценарии:** UC-75, UC-94 ([привязка](../use-cases.md))
**Модуль-владелец:** [payments](../modules.md#payments)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `telegramId`, `userId` | int, ref | да / нет | внешний сервис | payments | админу |
| `text` | string | да | ввод пользователя | payments | админу |
| `status` | enum(open, resolved) | да | ввод владельца | payments | админу |
| `at` | date | да | генерируется | payments | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.
