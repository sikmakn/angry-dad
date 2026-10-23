---
entity: Turn
status: подтверждено
---

# Turn · [← сводка](../00-overview.md)

Ход боя: резерв удара, оценки судьи, пересчёт, ответ актёра, итог.

**Связи:** → BattleDialog, StrikeOperation; ← AiCall
**Сценарии:** UC-66…UC-70 ([привязка](../use-cases.md))
**Модуль-владелец:** [battle](../modules.md#battle)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `clientTurnId` | string | да | ввод клиента (повтор отправки, R-95) | battle | нигде |
| `dialogId`, `userId` | ref | да | вычисляется | battle | нигде |
| `status` | enum(reserved, judged, done, failed) | да | вычисляется | battle | владельцу |
| `playerText` | string | да | ввод пользователя | battle | владельцу |
| `judge` | {hit, logic, originality, corner, weakSpotHit} | нет | внешний сервис | battle | нигде |
| `damage`, `defeatBefore`, `defeatAfter`, `mode`, `respectDelta` | числа, enum | нет | вычисляется | battle | владельцу |
| `failReason` | enum(judge_invalid, timeout, refusal, internal) | нет | вычисляется | battle | нигде |
| `startedAt` | date | да | генерируется | battle | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- (userId, clientTurnId) уникальна
- не больше одного хода в reserved/judged на диалог
- failed всегда имеет возврат удара

## Статусы и переходы
| из | событие | в |
|---|---|---|
| — | резерв удара (транзакция) | reserved |
| reserved | судья вернул валидную структуру | judged |
| judged | актёр ответил, фиксация (транзакция: шкалы, уважение, реплики) | done |
| reserved, judged | ошибка, таймаут 30 с, отказ, невалидный судья ×3 | failed (удар возвращён) |

Воркер переводит ходы, зависшие в reserved/judged дольше 45 с, в failed с возвратом удара.
