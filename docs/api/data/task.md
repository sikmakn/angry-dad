# Task и Period

Task хранит намерение пользователя, тип, размер и повторение; Period хранит конкретное окно выполнения, срок и исход. Даже разовая задача использует Period. У повторяющейся задачи история периодов позволяет отличать выполнение одного окна от остановки всей задачи.

Текущий `periodId` нужен для действий completion/extension/surrender/retry. Календарь рассчитывается в IANA-зоне пользователя; правила границ дня и переходов DST не следует воспроизводить собственным cron клиента. Состояние периода и актуальный deadline перечитываются внутри перехода.

Старые поля независимого расписания в архитектурной карточке Period не являются источником нового плана: по D6 им владеет отдельный TaskNotificationState. Удаление задачи скрывает Task, закрывает активные периоды и отменяет дальнейшее давление; физическая очистка связана с удалением аккаунта.

Подробные поля: [Task](../../architecture/mvp/entities/task.md), [Period](../../architecture/mvp/entities/period.md), [TaskNotificationState](../../architecture/mvp/entities/task-notification-state.md). Текущее поведение: [Tasks](../modules/tasks.md), [D6](../../architecture/mvp/task-notifications.md), [схема Period](../../../apps/api/src/database/schemas/period.schema.ts).
