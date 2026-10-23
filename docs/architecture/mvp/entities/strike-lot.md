---
entity: StrikeLot
status: подтверждено
---

# StrikeLot · [← сводка](../00-overview.md)

Партия ударов: покупка пакета или ручное начисление.

**Связи:** → User, StarsPayment
**Сценарии:** UC-72…UC-77 ([привязка](../use-cases.md))
**Модуль-владелец:** [strikes](../modules.md#strikes)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `userId` | ref(User) | да | вычисляется | strikes | нигде |
| `source` | enum(purchase, manual) | да | вычисляется | strikes | владельцу |
| `paymentId` | ref(StarsPayment) | для purchase | вычисляется | strikes | нигде |
| `total`, `remaining` | int | да | вычисляется | strikes | владельцу |
| `createdAt` | date | да | генерируется | strikes | владельцу |
| `refundedAt` | date | нет | вычисляется (возврат Stars) | payments | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- расход из самой ранней партии с остатком
- возврат Stars только если remaining = total

## Порядок расхода
Партии сортируются по `createdAt`; резерв удара уменьшает `remaining` самой ранней партии с остатком, возврат хода увеличивает `remaining` той же партии (`lotId` в операции).
