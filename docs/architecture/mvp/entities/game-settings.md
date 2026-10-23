---
entity: GameSettings
status: подтверждено
---

# GameSettings · [← сводка](../00-overview.md)

Настройки игры, которые владелец меняет без выпуска (A12).

**Связи:** —
**Сценарии:** UC-66, UC-89, UC-90 ([привязка](../use-cases.md))
**Модуль-владелец:** [analytics](../modules.md#analytics)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `battleCoefficients` | {base, damage, weakSpot, crit} | да | ввод владельца | analytics | админу |
| `aiDailyLimit` | int | да | ввод владельца (50, A-13 ТЗ) | analytics | админу |
| `otherNames` | list({name, gender, cases}) | да | ввод владельца | analytics | админу |
| `banditParams` | {trialShows, disableAvg, disableVotes} | да | ввод владельца | analytics | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- один документ; правка пишется в OwnerAction
