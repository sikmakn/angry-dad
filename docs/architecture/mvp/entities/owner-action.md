---
entity: OwnerAction
status: подтверждено
---

# OwnerAction · [← сводка](../00-overview.md)

Журнал действий владельца (R-133).

**Связи:** → User
**Сценарии:** UC-93 ([привязка](../use-cases.md))
**Модуль-владелец:** [analytics](../modules.md#analytics)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `action` | enum(phrase_add, phrase_toggle, paraphrase_review, role_card_edit, package_edit, strikes_grant, strikes_revoke, stars_refund, settings_edit) | да | вычисляется | модуль действия | админу |
| `targetUserId`, `targetId` | ref | нет | вычисляется | модуль действия | админу |
| `details` | {числа, причина} | нет | ввод владельца | модуль действия | админу |
| `at` | date | да | генерируется | модуль действия | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- записи только добавляются
