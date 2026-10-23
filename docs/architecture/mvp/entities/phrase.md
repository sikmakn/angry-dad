---
entity: Phrase
status: подтверждено
---

# Phrase · [← сводка](../00-overview.md)

Фраза пула с вариантами по роду и общей статистикой.

**Связи:** ← PhraseVote, FeedMessage
**Сценарии:** UC-49…UC-59, UC-89…UC-94 ([привязка](../use-cases.md))
**Модуль-владелец:** [phrases](../modules.md#phrases)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `id` | id | да | генерируется | система | админу |
| `role` | enum(father, mother, any) | да | ввод владельца | phrases | админу |
| `category`, `level` | enum, int | да / нет | ввод владельца | phrases | админу |
| `defeatLevel` | enum(1, 2, 3, 4, any) | да | ввод владельца | phrases | админу |
| `combo` | enum(father_son, father_daughter, mother_son, mother_daughter, any) | да | ввод владельца | phrases | админу |
| `template` | string с вариантами рода | да | ввод владельца или перефраз ai | phrases | админу |
| `source`, `author` | enum(owner, subscriber, paraphrase), string | да / нет | ввод владельца | phrases | админу |
| `status` | enum(enabled, disabled, pending_review) | да | ввод или вычисляется (автовыключение) | phrases | админу |
| `shows`, `votes`, `scoreSum` | int | да | вычисляется | phrases | админу |
| `belowThreshold` | bool | да | вычисляется (R-82) | phrases | админу |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- последнюю включённую фразу ячейки any × any не выключить

## Статусы
enabled ↔ disabled (вручную или автовыключение при avg < 0.4 и ≥ 100 голосах); pending_review → enabled | disabled (перефраз, решает владелец).

## Индексы
(role, category, level, defeatLevel, combo, status) для выбора кандидатов.
