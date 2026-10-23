---
entity: AnalyticsEvent
status: подтверждено
---

# AnalyticsEvent · [← сводка](../00-overview.md)

Событие метрик (N-17) без текстов задач и реплик.

**Связи:** → User
**Сценарии:** UC-90 ([привязка](../use-cases.md))
**Модуль-владелец:** [analytics](../modules.md#analytics)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `type` | enum(onboarding_done, task_created, check_in_sent, check_in_answered, period_done, period_failed, phrase_rated, turn, purchase, refund, share, bot_blocked, account_deleted) | да | вычисляется | все модули | нигде |
| `userId` | ref(User) | нет | вычисляется (обезличивается при удалении) | все модули | нигде |
| `props` | {числа и enum} | нет | вычисляется | все модули | нигде |
| `at` | date | да | генерируется | все модули | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- нет текстов задач и реплик
