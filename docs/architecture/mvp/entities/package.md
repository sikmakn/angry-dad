---
entity: Package
status: подтверждено
---

# Package · [← сводка](../00-overview.md)

Пакет ударов в магазине с ценой в Stars.

**Связи:** ← StarsPayment
**Сценарии:** UC-72, UC-90 ([привязка](../use-cases.md))
**Модуль-владелец:** [payments](../modules.md#payments)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `strikes` | int | да | ввод владельца | payments | всем |
| `priceStars` | int | да | ввод владельца | payments | всем |
| `active`, `order` | bool, int | да | ввод владельца | payments | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.
