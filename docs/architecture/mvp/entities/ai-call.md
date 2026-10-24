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
| `inputTokens`, `outputTokens` | int | нет, если usage неизвестен | внешний сервис | ai | нигде |
| `costMicros` | number | нет, если стоимость неизвестна | шлюз / тарифная оценка, micro-USD | ai | нигде |
| `costSource` | enum(provider, estimate, mock, unknown) | для новых записей | вычисляется | ai | нигде |
| `inputUsdPerMillion`, `outputUsdPerMillion` | number | для новых записей | снимок тарифов конфигурации | ai | нигде |
| `outcome` | enum(pending, ok, invalid, timeout, refusal, error) | да | вычисляется | ai | нигде |
| `latencyMs`, `at` | int, date | да | вычисляется | ai | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- текстов запроса и ответа не хранит (N-17)
- Валюта USD, одна единица `costMicros` — миллионная доля доллара. Запись создаётся до вызова; каждая попытка и её валидация связаны по точному id записи. Отсутствие usage/стоимости не означает ноль. Индекс `{turnId, at}`. Формулы, временные тарифы и ограничения таймаута — [аналитика](../analytics.md).
