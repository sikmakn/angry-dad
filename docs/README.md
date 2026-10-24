# Документация Angry Dad

Angry Dad («Батя») — Telegram Mini App для задач со сроками, репликами персонажа и боем за удары.

| Что | Зачем | Ссылка | Статус |
|---|---|---|---|
| Frontend MVP | Экраны, данные, разработка и доказательства проверок | [Web](web/README.md) | актуально, стыковка с API завершена |
| Руководство frontend | Действия пользователя и восстановление | [Сценарии](guide/README.md) | актуально |
| Ограничения frontend | Расхождения и границы интеграции | [Ограничения](limitations/README.md) | актуально |
| Карта продукта | Статусы функций, поддерживает координатор | [Карта](product/map.md) | источник статусов |
| Требования MVP | Намерение продукта и критерии | [ТЗ](specs/mvp/spec.md) | утверждено |
| Архитектура MVP | Границы приложений и сценарии API | [Обзор](architecture/mvp/00-overview.md), [карта контракта](architecture/mvp/contract-map.md) | утверждено |
| Backend MVP | Запуск API/worker, модули, данные и конфигурация | [API](api/README.md) | актуально |
| Проверки backend | Ревью, охват тестов и пределы | [Результаты](testing/mvp-backend-results.md) | 176 тестов, общий шлюз зелёный |
| Стыковка frontend/API | Изменения клиента и HTTP/БД smoke | [Отчёт](web/api-integration.md) | общая сборка проверена |
| HTTP-контракт | Генерируется из NestJS controllers/DTO; YAML/JSON не редактируются вручную | [OpenAPI](openapi.yaml), [экспорт](architecture/mvp/api-contract.md) | фактический контракт |
| Дизайн MVP | Утверждённые экраны и тексты | [Дизайн](design/mvp/README.md), [тексты](design/mvp/copy.md) | утверждено, см. итог одобрения |
