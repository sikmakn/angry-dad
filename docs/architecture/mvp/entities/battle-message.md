---
entity: BattleMessage
status: подтверждено
---

# BattleMessage · [← сводка](../00-overview.md)

Реплика в диалоге: игрока, актёра или добавленное сообщение персонажа.

**Связи:** → BattleDialog
**Сценарии:** UC-60…UC-69 ([привязка](../use-cases.md))
**Модуль-владелец:** [battle](../modules.md#battle)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `dialogId`, `seq` | ref, int | да | вычисляется | battle | владельцу |
| `author` | enum(player, character) | да | вычисляется | battle | владельцу |
| `text` | string | да | ввод пользователя или внешний сервис | battle | владельцу |
| `origin` | enum(turn, reply_to_feed, battle_start, break) | да | вычисляется | battle | владельцу |
| `taskTitle` | string | нет | копия-снимок из Task (пометка задачи R-87) | battle | владельцу |
| `turnId` | ref(Turn) | нет | вычисляется | battle | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- реплики хода появляются только при фиксации хода
