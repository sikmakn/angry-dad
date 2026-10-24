# BattleDialog и контекст

Диалог связывает пользователя и роль; публично доступна текущая роль. BattleMessage хранит последовательность реплик, Turn — состояние конкретной платной попытки. Feed quote пополняет ту же историю и сохраняет связь с источником, без нового независимого боя.

`activeTurnId` исключает одновременные незавершённые ходы одного диалога. Summary и `summaryUpTo` отделяют уже сжатую часть от хвоста; сообщения после этой границы передаются актёру вместе с готовым summary. Сжатие выполняется фоном с условным сохранением границы и не удаляет смысл связи попытки с расходом AI.

Источники: [BattleDialog](../../architecture/mvp/entities/battle-dialog.md), [BattleMessage](../../architecture/mvp/entities/battle-message.md), [Turn](../../architecture/mvp/entities/turn.md), [реализация контекста](../../../apps/api/src/modules/battle/services/turn.service.ts), [worker recovery](../../../apps/api/src/modules/battle/services/turn-recovery.service.ts).
