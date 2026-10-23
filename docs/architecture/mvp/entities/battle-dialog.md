---
entity: BattleDialog
status: подтверждено
---

# BattleDialog · [← сводка](../00-overview.md)

Диалог боя на пару «пользователь, роль» с побеждённостью и изложением.

**Связи:** → User; ← BattleMessage, Turn
**Сценарии:** UC-60…UC-71 ([привязка](../use-cases.md))
**Модуль-владелец:** [battle](../modules.md#battle)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `userId`, `role` | ref(User), enum | да | вычисляется | battle | нигде |
| `defeat`, `defeatAt` | decimal, date | да | вычисляется; откат при чтении (A6) | battle | владельцу |
| `brokenArmed` | bool | да | вычисляется (слом снова возможен после < 75) | battle | нигде |
| `defeatAtLastTurn` | decimal | да | вычисляется (onRecovery R-105) | battle | нигде |
| `summary`, `summaryUpTo` | string, int | нет | внешний сервис (сжатие) | battle | нигде |
| `activeTurnId` | ref(Turn) | нет | вычисляется (один ход за раз) | battle | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- пара (userId, role) уникальна; defeat в [0; 100]
