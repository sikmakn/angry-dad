# StarsPayment и финансовые снимки

Счёт хранит стабильный invoice payload, снимок пакета и курса. Charge ID защищает от повторного начисления независимо от срока ключа запроса. StrikeLot хранит остатки партии; StrikeOperation — движение, происхождение и экономическое состояние резерва/расхода/возврата.

Обычное подтверждение атомарно переводит `invoiced` в `credited` и начисляет удары. Старая диаграмма с обязательным промежуточным `paid` уточнена D5. `paid` остаётся для восстановления и исключений удаления пользователя; отсутствие записи в истории Stars не переводит счёт в произвольно выбранный конечный статус.

PaymentIncident сохраняет несовпадающие подтверждения и найденные возвраты для разбирательства. Это отдельная внутренняя коллекция, а не новый публичный маршрут. Изменение курса/пакета не переоценивает сохранённые финансовые снимки. Финансовая история сохраняется после удаления аккаунта.

Источники: [StarsPayment](../../architecture/mvp/entities/stars-payment.md), [StrikeLot](../../architecture/mvp/entities/strike-lot.md), [StrikeOperation](../../architecture/mvp/entities/strike-operation.md), [D5/D7](../../architecture/mvp/decisions.md#принято), [PaymentIncident schema](../../../apps/api/src/database/schemas/payment-incident.schema.ts), [подтверждение](../../../apps/api/src/modules/payments/payments.service.ts).
