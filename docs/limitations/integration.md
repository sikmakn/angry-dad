# Конфигурация и границы интеграции

## Данные владельца

В [дизайне](../design/mvp/README.md) username бота и полный legal text оставлены входными данными владельца. [Адаптер](../../apps/web/src/platform/telegram.ts) читает `VITE_BOT_USERNAME` и `VITE_TERMS_URL`. [App](../../apps/web/src/App.tsx) без username показывает сообщение о ненастроенном боте; [LegalContent](../../apps/web/src/components/LegalContent.tsx) без URL сообщает о публикации владельцем и сохраняет пояснение внешнего ИИ. Требование согласия/информирования: [F-1 / R-3](../specs/mvp/functions/F-1-start.md).

Окончательные username, опубликованные условия и политика ещё не предоставлены. Заглушка не является готовым юридическим текстом. Значения окружений и секреты здесь не публикуются; [setup](../web/setup.md) описывает только конфигурационные точки.

## Интеграция и доказательства

Frontend состыкован с фактическим backend snapshot в отдельном worktree. [Архитектурная карта](../architecture/mvp/contract-map.md) распределяет HTTP, webhook и фоновые обязанности; [web-клиент](../../apps/web/src/api/client.ts) работает с HTTP, проверены общая сборка, frontend doubles и отдельный живой сценарий Chromium → Vite → Nest → изолированная MongoDB replica set. Подробности — [отчёт стыковки](../web/api-integration.md).

Подпись initData проверена на настоящем Nest guard с синтетическим тестовым токеном (валидный вход и отклонение неверной подписи). Реальные бот `/start`, Telegram launch/истечение реальной сессии, Stars/invoice/webhook/возвраты, сообщения по расписанию и тихие часы, ИИ и рендер/обезличивание карточек не подтверждены этим этапом. Реальный ИИ позднее подключён в `aadac8d`; сообщение merge сообщает о пяти живых запросах, но полного eval нет: [текущая сверка](ai-and-notifications.md). Намерение интеграций описано в [F-1](../specs/mvp/functions/F-1-start.md), [F-7](../specs/mvp/functions/F-7-notifications.md), [F-12](../specs/mvp/functions/F-12-battle-turn.md), [F-13](../specs/mvp/functions/F-13-payments.md), [F-14](../specs/mvp/functions/F-14-sharing.md). Тестовый double показывает реакцию UI, а не работу внешних платформ.

Вне Telegram без initData реальный режим не даёт вход; покупка и шеринг требуют поддерживаемой версии/метода. В MSW они выключены, данные демонстрационные и сбрасываются после reload: [режимы](../web/setup.md).

Итог browser — 7 passed на одном установленном Chrome, а не полный WCAG, проверка всех экранов/состояний или устройств Telegram. Статические и frontend проверки не придают всей фиче статус verified. Полная хронология и факты находятся в [testing](../web/testing.md); карта продукта поддерживается координатором.
