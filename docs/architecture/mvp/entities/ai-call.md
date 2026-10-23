---
entity: AiCall
status: подтверждено
---

# AiCall · [← сводка](../00-overview.md)

Вызов ИИ: задача, модель, токены, стоимость, исход. Без текстов.

**Связи:** → User, Turn
**Сценарии:** UC-15, UC-66, UC-68 ([привязка](../use-cases.md))
**Модуль-владелец:** [ai](../modules.md#ai)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `purpose` | enum(specificity, judge, actor, summary, paraphrase) | да | вычисляется | ai | нигде |
| `provider`, `model` | string | да | настройка | ai | нигде |
| `userId`, `turnId` | ref | нет | вычисляется | ai | нигде |
| `inputTokens`, `outputTokens`, `costMicros` | int | да | внешний сервис / вычисляется | ai | нигде |
| `outcome` | enum(ok, invalid, timeout, refusal, error) | да | вычисляется | ai | нигде |
| `latencyMs`, `at` | int, date | да | вычисляется | ai | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- текстов запроса и ответа не хранит (N-17)
