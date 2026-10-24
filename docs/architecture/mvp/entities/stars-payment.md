---
entity: StarsPayment
status: подтверждено
---

# StarsPayment · [← сводка](../00-overview.md)

Платёж Stars за пакет; ключ ровно одного начисления.

**Связи:** → User, Package; ← StrikeLot
**Сценарии:** UC-72…UC-75 ([привязка](../use-cases.md))
**Модуль-владелец:** [payments](../modules.md#payments)

## Поля
| поле | тип | обязательное | откуда значение | кто пишет | в API |
|---|---|---|---|---|---|
| `invoicePayload` | string | да | генерируется при создании счёта | payments | нигде |
| `userId`, `telegramId` | ref, int | да | вычисляется; telegramId остаётся после удаления (A13) | payments | админу |
| `packageSnapshot` | {strikes, priceStars} | да | копия-снимок из Package (цена на момент счёта) | payments | владельцу |
| `status` | enum(invoiced, paid, credited, refunded) | да | вычисляется | payments | админу |
| `telegramChargeId` | string | после оплаты | внешний сервис | payments | админу |
| `paidAt`, `creditedAt` | date | нет | вычисляется | payments | админу |
| `starsUsdPerStar` | number | для новых записей | снимок курса из `.env` при создании счёта | payments | нигде |

«В API»: владельцу — хозяину записи; админу — владельцу продукта.

## Инварианты
- telegramChargeId уникален
- Курс по D7 заполняется один раз; повтор и смена `.env` не переоценивают существующую запись. Старый платёж без курса получает снимок при подтверждении. [Денежная аналитика](../analytics.md#деньги-и-тарифы).
- paid без credited дозачисляет воркер не позже 1 минуты

## Статусы и переходы
| из | событие | в |
|---|---|---|
| — | счёт создан | invoiced |
| invoiced | `successful_payment` (уникальный charge id) | paid |
| paid | начисление партии ударов (транзакция) | credited |
| credited | возврат Stars владельцем | refunded |

Повторное `successful_payment` с тем же charge id игнорируется. Воркер дозачисляет `paid` старше 20 с.
