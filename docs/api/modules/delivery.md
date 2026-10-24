# Delivery и лента

Модуль исполняет отправку outbox и обслуживает `GET /feed`, `PUT /feed/{feedMessageId}/rating`, `PUT /feed/{feedMessageId}/check-in-answer`. Подготовленный черновик не является доставленным сообщением и скрыт из пользовательской истории до подтверждения отправки.

Dispatcher берёт записи в аренду, проверяет актуальность общего плана пользователя и отправляет через Telegram вне Mongo-транзакции. Выбор фразы и состояние персонажа относятся к моменту отправки. Успех фиксирует факт доставки; сетевой отказ, неизвестный исход и запоздалый результат обрабатываются по-разному. Аренда Mongo не превращает внешний Bot API в exactly-once транспорт.

Ответ check-in проверяет владение, состояние сообщения и периода. «Сделано» использует переход задачи; другие допустимые ответы возвращают готовый `reply`. Бот отправляет этот ответ и подтверждает callback, не выполняя повторно бизнес-переход.

При расследовании отличайте сохранённый план, outbox draft и подтверждённый feed. Отсутствие сообщения в ленте не доказывает отсутствие сетевой попытки. Для редких гонок удаления и ошибок БД вокруг отправки остаются [пределы тестов](../../testing/mvp-backend-results.md#пределы).

Источники: [dispatcher](../../../apps/api/src/modules/delivery/services/dispatcher.service.ts), [feed](../../../apps/api/src/modules/delivery/services/feed.service.ts), [OutboxMessage](../../architecture/mvp/entities/outbox-message.md), [FeedMessage](../../architecture/mvp/entities/feed-message.md), [политика](task-notifications.md).
