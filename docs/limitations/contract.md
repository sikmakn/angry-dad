# Расхождения контракта и frontend

Вопросы ниже отложены пользователем для общей интеграции. Документация отражает текущее поведение и не выбирает новое продуктовое решение. HTTP-схемы и enum остаются в [OpenAPI](../openapi.yaml).

## Preview карточки

[F-14](../specs/mvp/functions/F-14-sharing.md) и [макет share-card](../design/mvp/screens/share-card.html) предусматривают карточку-изображение. `ShareResponse` в [OpenAPI](../openapi.yaml) содержит только `preparedMessageId`; preview/URL изображения отсутствует. [ShareScreen](../../apps/web/src/sharing/ShareScreen.tsx) объясняет серверную подготовку, [useShare](../../apps/web/src/sharing/hooks/useShare.ts) передаёт ID в Telegram. Фронт не подставляет демо-изображение за результат API; реальный preview остаётся вопросом контракта.

## Похвала после reload

[F-4 / UC-19](../specs/mvp/functions/F-4-one-time-task.md#uc-19) и [макет Готово](../design/mvp/screens/done.html) показывают onSuccess. В [OpenAPI](../openapi.yaml) фраза приходит в `PeriodActionResponse.reply`, но `TaskResponse`/текущий период не дают снимок успеха для восстановления экрана. [TaskOutcome](../../apps/web/src/tasks/components/TaskOutcome.tsx) показывает ответ сразу после действия, а после reload — статус/дельту без выдуманной похвалы. Провал восстанавливается через failMessage. Связать успех с сохраняемым сообщением или иначе менять контракт — отложенное решение.

## Доступность продления

[F-4](../specs/mvp/functions/F-4-one-time-task.md) ограничивает продление одним разом за сутки; [макет задачи](../design/mvp/screens/task.html) имеет состояние использованного продления. [Карта контракта](../architecture/mvp/contract-map.md) прямо относит `lastExtendedOn` к скрытым полям, [PeriodResponse](../openapi.yaml) не даёт эквивалентной возможности заранее определить доступность. В [TaskScreen](../../apps/web/src/tasks/TaskScreen.tsx) кнопка доступна у активного периода, пока нет pending; повторное недопустимое действие отклоняет сервер. Точное отключение по дню пока не реализуется клиентом.

## Идемпотентность создания задачи

Текущий main-контракт [POST /tasks](../openapi.yaml) ссылается на `OptionalIdempotencyKey`. По переданному координатором контексту незавершённый backend-черновик в другом worktree ещё расходится с этой частью main. Его код этой ролью не проверялся, окончательное поведение сервера здесь не утверждается.

[useTaskForm](../../apps/web/src/tasks/hooks/useTaskForm.ts) сейчас не передаёт ключ для создания задачи, а [client](../../apps/web/src/api/client.ts) добавляет его только при наличии options.key. [Локальный guard](../../apps/web/src/tasks/taskSubmissionRecovery.ts) блокирует повтор после неизвестного результата и требует проверки списка; он не заменяет серверную идемпотентность. Согласование с backend остаётся координатору; Optional означает, что отсутствие ключа само по себе не нарушает текущую схему main. Продуктовое решение документацией не меняется.

## Границы кабинета владельца

[F-16 / R-130](../specs/mvp/functions/F-16-owner.md) описывает управление пакетами; [OpenAPI](../openapi.yaml) содержит создание пакетов и игровые настройки. В [карте контракта](../architecture/mvp/contract-map.md) операции game-settings включены в owner-сценарии. В утверждённом [макете owner](../design/mvp/screens/owner.html) нет форм создания пакета и редактирования игровых настроек.

[OwnerRoles](../../apps/web/src/owner/components/OwnerRoles.tsx) отображает редакторы существующих пакетов, [useOwnerEditors](../../apps/web/src/owner/hooks/useOwnerEditors.ts) сохраняет их; [OwnerScreen](../../apps/web/src/owner/OwnerScreen.tsx) не предлагает game-settings. Операции присутствуют в [таблице клиента](../../apps/web/src/api/operations.ts), но наличие операции не означает пользовательский UI. Эти формы не включены в frontend по границе утверждённых макетов.
