---
entity: StrikeOperation
status: подтверждено
---

# StrikeOperation · [← сводка](../00-overview.md)

Операция с ударами для истории: покупка, списание, возврат, начисление, возврат Stars.

**Связи:** → User, StrikeLot, Turn
**Сценарии:** UC-68, UC-72…UC-77, UC-91 ([привязка](../use-cases.md))
**Модуль-владелец:** [strikes](../modules.md#strikes)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `userId`, `lotId` | ref | да | вычисляется | strikes | нигде |
| `type` | enum(purchase, spend, turn_refund, manual_grant, manual_revoke, stars_refund) | да | вычисляется | strikes | владельцу |
| `amount` | int | да | вычисляется | strikes | владельцу |
| `reason` | string | для ручных и возвратов | ввод владельца или вычисляется | strikes | владельцу |
| `turnId` | ref(Turn) | нет | вычисляется | strikes | нигде |
| `at` | date | да | генерируется | strikes | владельцу |
| `paidStrike` | boolean | у новых spend | снимок происхождения партии | strikes | нигде |
| `paidUnitRevenueMicros` | number | у spend с известной платной оценкой | снимок цены единицы в micro-USD | strikes | нигде |
| `economicState` | enum(reserved, consumed, refunded) | у новых spend | резерв, завершение хода, возврат | strikes, battle | нигде |

Экономическое состояние меняется в существующих финансовых транзакциях; эти поля не меняют ключи повторов и баланс. Снимки сохраняются вместе с финансовой историей. Формула — [аналитика](../analytics.md#деньги-и-тарифы).

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- возврат хода ровно один на списание (по turnId)
