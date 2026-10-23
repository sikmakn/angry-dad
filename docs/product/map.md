# Карта продукта

Статусы функций: `идея` → `в ТЗ` → `в архитектуре` → `в контракте` → `реализовано` → `проверено`. Каждый шаг конвейера двигает статус своих функций.

ТЗ: [specs/mvp/spec.md](../specs/mvp/spec.md) (версия 4). Архитектура: [architecture/mvp](../architecture/mvp/00-overview.md).

## Ядро: задачи и давление (этап 1)
| id | функция | кто | статус | описание |
|---|---|---|---|---|
| F-1 | Старт и вход через бота | гость, пользователь | в контракте | [F-1](../specs/mvp/functions/F-1-start.md) |
| F-2 | Профиль, настройки и удаление аккаунта | пользователь | в контракте | [F-2](../specs/mvp/functions/F-2-settings.md) |
| F-3 | Постановка задачи | пользователь | в контракте | [F-3](../specs/mvp/functions/F-3-task-create.md) |
| F-4 | Разовая задача: жизненный цикл | пользователь | в контракте | [F-4](../specs/mvp/functions/F-4-one-time-task.md) |
| F-5 | Повторяющаяся задача: периоды | пользователь | в контракте | [F-5](../specs/mvp/functions/F-5-recurring-task.md) |
| F-6 | Проверки «покажи, что сделано» | пользователь | в контракте | [F-6](../specs/mvp/functions/F-6-check-ins.md) |
| F-7 | Напоминания, уведомления и тихие часы | пользователь | в контракте | [F-7](../specs/mvp/functions/F-7-notifications.md) |
| F-8 | Шкала «Уважение» | пользователь | в контракте | [F-8](../specs/mvp/functions/F-8-respect.md) |
| F-9 | Пул фраз и подстановка | пользователь, владелец | в контракте | [F-9](../specs/mvp/functions/F-9-phrase-pool.md) |
| F-10 | Оценка фраз, выбор фраз и история | пользователь, владелец | в контракте | [F-10](../specs/mvp/functions/F-10-phrase-rating.md) |
| F-14 | Шеринг | пользователь | в контракте | [F-14](../specs/mvp/functions/F-14-sharing.md) |
| F-15 | Общий рейтинг | пользователь | в контракте | [F-15](../specs/mvp/functions/F-15-leaderboard.md) |
| F-16 | Функции владельца | владелец | в контракте | [F-16](../specs/mvp/functions/F-16-owner.md) |

## Бой и оплата (этап 2)
| id | функция | кто | статус | описание |
|---|---|---|---|---|
| F-11 | Диалог боя | пользователь | в контракте | [F-11](../specs/mvp/functions/F-11-battle-dialog.md) |
| F-12 | Ход боя, шкалы и слом | пользователь, владелец | в контракте | [F-12](../specs/mvp/functions/F-12-battle-turn.md) |
| F-13 | Удары и оплата Telegram Stars | пользователь, владелец | в контракте | [F-13](../specs/mvp/functions/F-13-payments.md) |

### F-1 Старт и вход через бота: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | `/start`, выбор родителя и пола, первая фраза | [UC-1](../specs/mvp/functions/F-1-start.md#uc-1) |
| альтернативный | повторный старт после удаления аккаунта | [UC-2](../specs/mvp/functions/F-1-start.md#uc-2) |
| ошибка | родитель не выбран, пояс не определён | [UC-3](../specs/mvp/functions/F-1-start.md#uc-3) |
| граница | повторный `/start`, смена пояса устройства | [UC-4](../specs/mvp/functions/F-1-start.md#uc-4) |
| права | гость без завершённого старта | [UC-5](../specs/mvp/functions/F-1-start.md#uc-5) |
| пустое состояние | `/start` без открытия Mini App | [UC-6](../specs/mvp/functions/F-1-start.md#uc-6) |

### F-2 Профиль, настройки и удаление аккаунта: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | смена родителя | [UC-7](../specs/mvp/functions/F-2-settings.md#uc-7) |
| альтернативный | смена пола и часового пояса | [UC-8](../specs/mvp/functions/F-2-settings.md#uc-8) |
| ошибка | тихие часы длиннее 12 часов | [UC-9](../specs/mvp/functions/F-2-settings.md#uc-9) |
| граница | удаление аккаунта с ударами | [UC-10](../specs/mvp/functions/F-2-settings.md#uc-10) |
| права | чужие настройки, данные удалённого | [UC-11](../specs/mvp/functions/F-2-settings.md#uc-11) |
| пустое состояние | удаление аккаунта без задач и ударов | [UC-12](../specs/mvp/functions/F-2-settings.md#uc-12) |

### F-3 Постановка задачи: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | разовая задача на завтра | [UC-13](../specs/mvp/functions/F-3-task-create.md#uc-13) |
| альтернативный | повторяющаяся задача из текста | [UC-14](../specs/mvp/functions/F-3-task-create.md#uc-14) |
| ошибка | расплывчатое название, сбой проверки | [UC-15](../specs/mvp/functions/F-3-task-create.md#uc-15) |
| граница | длина названия, пределы дедлайна, суточный лимит проверок | [UC-16](../specs/mvp/functions/F-3-task-create.md#uc-16) |
| права | гость не ставит задачи | [UC-17](../specs/mvp/functions/F-3-task-create.md#uc-17) |
| пустое состояние | первая задача после старта | [UC-18](../specs/mvp/functions/F-3-task-create.md#uc-18) |

### F-4 Разовая задача: жизненный цикл: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | «Готово» под напоминанием | [UC-19](../specs/mvp/functions/F-4-one-time-task.md#uc-19) |
| альтернативный | продление, переименование, удаление | [UC-20](../specs/mvp/functions/F-4-one-time-task.md#uc-20) |
| альтернативный | «Сдаюсь», провал, «Сделаю за час» | [UC-21](../specs/mvp/functions/F-4-one-time-task.md#uc-21) |
| ошибка | действие над закрытой задачей | [UC-22](../specs/mvp/functions/F-4-one-time-task.md#uc-22) |
| граница | второе продление, «Готово» после дедлайна, границы настроения | [UC-23](../specs/mvp/functions/F-4-one-time-task.md#uc-23) |
| права | чужая задача | [UC-24](../specs/mvp/functions/F-4-one-time-task.md#uc-24) |
| пустое состояние | нет активных задач | [UC-25](../specs/mvp/functions/F-4-one-time-task.md#uc-25) |

### F-5 Повторяющаяся задача: периоды: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | ежедневная задача, закрытие периода | [UC-26](../specs/mvp/functions/F-5-recurring-task.md#uc-26) |
| альтернативный | раз в неделю без дня, остановка | [UC-27](../specs/mvp/functions/F-5-recurring-task.md#uc-27) |
| ошибка | пропуск периода | [UC-28](../specs/mvp/functions/F-5-recurring-task.md#uc-28) |
| граница | «Сдаюсь», продление и «Сделаю за час» в периоде, первый период, срок за полночь | [UC-29](../specs/mvp/functions/F-5-recurring-task.md#uc-29) |
| права | чужая задача | [UC-30](../specs/mvp/functions/F-5-recurring-task.md#uc-30) |
| пустое состояние | будни, суббота | [UC-31](../specs/mvp/functions/F-5-recurring-task.md#uc-31) |

### F-6 Проверки «покажи, что сделано»: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | проверка и «Сделано» | [UC-32](../specs/mvp/functions/F-6-check-ins.md#uc-32) |
| альтернативный | застой и серия проверок | [UC-33](../specs/mvp/functions/F-6-check-ins.md#uc-33) |
| ошибка | нет ответа 15 минут, нет ответа час | [UC-34](../specs/mvp/functions/F-6-check-ins.md#uc-34) |
| граница | короткий дедлайн, закрытие до ответа, интервал 3 минуты, тихие часы, реже после победы | [UC-35](../specs/mvp/functions/F-6-check-ins.md#uc-35) |
| права | пересланная проверка | [UC-36](../specs/mvp/functions/F-6-check-ins.md#uc-36) |
| пустое состояние | нет активных задач | [UC-37](../specs/mvp/functions/F-6-check-ins.md#uc-37) |

### F-7 Напоминания, уведомления и тихие часы: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | напоминания и onFail | [UC-38](../specs/mvp/functions/F-7-notifications.md#uc-38) |
| альтернативный | onAbsent трёх уровней | [UC-39](../specs/mvp/functions/F-7-notifications.md#uc-39) |
| ошибка | блокировка бота, простой | [UC-40](../specs/mvp/functions/F-7-notifications.md#uc-40) |
| граница | короткий дедлайн, продление, совпадение, тихие часы, дедлайн ночью | [UC-41](../specs/mvp/functions/F-7-notifications.md#uc-41) |
| права | гость без сообщений | [UC-42](../specs/mvp/functions/F-7-notifications.md#uc-42) |
| пустое состояние | нет активных задач | [UC-43](../specs/mvp/functions/F-7-notifications.md#uc-43) |

### F-8 Шкала «Уважение»: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | изменения по событиям ядра, закрытие сразу после создания | [UC-44](../specs/mvp/functions/F-8-respect.md#uc-44) |
| альтернативный | рост в бою | [UC-45](../specs/mvp/functions/F-8-respect.md#uc-45) |
| ошибка | ход боя с ошибкой | [UC-46](../specs/mvp/functions/F-8-respect.md#uc-46) |
| граница | 94 и 0 | [UC-47](../specs/mvp/functions/F-8-respect.md#uc-47) |
| права | изменение в обход событий | [UC-48](../specs/mvp/functions/F-8-respect.md#uc-48) |
| пустое состояние | не применимо: шкала всегда есть с 12 | [F-8](../specs/mvp/functions/F-8-respect.md#пустое-состояние) |

### F-9 Пул фраз и подстановка: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | подстановка рода и переменных | [UC-49](../specs/mvp/functions/F-9-phrase-pool.md#uc-49) |
| альтернативный | уровень побеждённости и сочетание | [UC-50](../specs/mvp/functions/F-9-phrase-pool.md#uc-50) |
| ошибка | пустое имя, нет фраз уровня | [UC-51](../specs/mvp/functions/F-9-phrase-pool.md#uc-51) |
| граница | недобор минимумов | [UC-52](../specs/mvp/functions/F-9-phrase-pool.md#uc-52) |
| права | не применимо: правка пула в F-16 | [UC-93](../specs/mvp/functions/F-16-owner.md#uc-93) |
| пустое состояние | последняя фраза ячейки | [UC-53](../specs/mvp/functions/F-9-phrase-pool.md#uc-53) |

### F-10 Оценка фраз, выбор фраз и история: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | оценка проверки | [UC-54](../specs/mvp/functions/F-10-phrase-rating.md#uc-54) |
| альтернативный | оценка и «Ответить» из «Истории» | [UC-55](../specs/mvp/functions/F-10-phrase-rating.md#uc-55) |
| ошибка | повторная оценка | [UC-56](../specs/mvp/functions/F-10-phrase-rating.md#uc-56) |
| граница | пробный период, порог выключения, повторы | [UC-57](../specs/mvp/functions/F-10-phrase-rating.md#uc-57) |
| права | чужая история, общая статистика | [UC-58](../specs/mvp/functions/F-10-phrase-rating.md#uc-58) |
| пустое состояние | история сразу после старта | [UC-59](../specs/mvp/functions/F-10-phrase-rating.md#uc-59) |

### F-11 Диалог боя: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | «Ответить» под проверкой | [UC-60](../specs/mvp/functions/F-11-battle-dialog.md#uc-60) |
| альтернативный | бой из меню и с экрана «Провал» | [UC-61](../specs/mvp/functions/F-11-battle-dialog.md#uc-61) |
| ошибка | нет ударов, пустая реплика | [UC-62](../specs/mvp/functions/F-11-battle-dialog.md#uc-62) |
| граница | 300 символов, сжатие, слом и задача | [UC-63](../specs/mvp/functions/F-11-battle-dialog.md#uc-63) |
| права | чужой диалог, смена роли | [UC-64](../specs/mvp/functions/F-11-battle-dialog.md#uc-64) |
| пустое состояние | первый бой с ролью | [UC-65](../specs/mvp/functions/F-11-battle-dialog.md#uc-65) |

### F-12 Ход боя, шкалы и слом: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | ход с критом и больным местом | [UC-66](../specs/mvp/functions/F-12-battle-turn.md#uc-66) |
| альтернативный | угол и слом | [UC-67](../specs/mvp/functions/F-12-battle-turn.md#uc-67) |
| ошибка | сбой судьи, таймаут, отказ провайдера | [UC-68](../specs/mvp/functions/F-12-battle-turn.md#uc-68) |
| граница | двойная отправка, границы режимов, награда, откат | [UC-69](../specs/mvp/functions/F-12-battle-turn.md#uc-69) |
| права | инъекция, правка карточки роли | [UC-70](../specs/mvp/functions/F-12-battle-turn.md#uc-70) |
| пустое состояние | стартовое состояние персонажа | [UC-71](../specs/mvp/functions/F-12-battle-turn.md#uc-71) |

### F-13 Удары и оплата Telegram Stars: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | покупка пакета | [UC-72](../specs/mvp/functions/F-13-payments.md#uc-72) |
| альтернативный | покупка из боя | [UC-73](../specs/mvp/functions/F-13-payments.md#uc-73) |
| ошибка | отмена, дубль подтверждения, сбой начисления | [UC-74](../specs/mvp/functions/F-13-payments.md#uc-74) |
| граница | возврат удара, возврат Stars, порядок расхода, удалённый аккаунт, условия | [UC-75](../specs/mvp/functions/F-13-payments.md#uc-75) |
| права | начисление в обход оплаты, ручное начисление | [UC-76](../specs/mvp/functions/F-13-payments.md#uc-76) |
| пустое состояние | нет покупок | [UC-77](../specs/mvp/functions/F-13-payments.md#uc-77) |

### F-14 Шеринг: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | карточка слома | [UC-78](../specs/mvp/functions/F-14-sharing.md#uc-78) |
| альтернативный | карточки «Готово» и «Провал» | [UC-79](../specs/mvp/functions/F-14-sharing.md#uc-79) |
| ошибка | карточка не создана | [UC-80](../specs/mvp/functions/F-14-sharing.md#uc-80) |
| граница | личное название задачи и имя в фразе | [UC-81](../specs/mvp/functions/F-14-sharing.md#uc-81) |
| права | не применимо: на карточке нет данных пользователя | [F-14](../specs/mvp/functions/F-14-sharing.md#права) |
| пустое состояние | карточка до первого хода | [UC-82](../specs/mvp/functions/F-14-sharing.md#uc-82) |

### F-15 Общий рейтинг: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | вход в рейтинг | [UC-83](../specs/mvp/functions/F-15-leaderboard.md#uc-83) |
| альтернативный | выход из рейтинга | [UC-84](../specs/mvp/functions/F-15-leaderboard.md#uc-84) |
| ошибка | нет username | [UC-85](../specs/mvp/functions/F-15-leaderboard.md#uc-85) |
| граница | место вне сотни, равенство, удаление задачи, закрытие сразу после создания | [UC-86](../specs/mvp/functions/F-15-leaderboard.md#uc-86) |
| права | что видно о других | [UC-87](../specs/mvp/functions/F-15-leaderboard.md#uc-87) |
| пустое состояние | нет участников | [UC-88](../specs/mvp/functions/F-15-leaderboard.md#uc-88) |

### F-16 Функции владельца: сценарии
| тип | сценарий | ссылка |
|---|---|---|
| основной | фраза подписчика и перефразы | [UC-89](../specs/mvp/functions/F-16-owner.md#uc-89) |
| альтернативный | включение фразы, цена, метрики | [UC-90](../specs/mvp/functions/F-16-owner.md#uc-90) |
| ошибка | начисление без причины | [UC-91](../specs/mvp/functions/F-16-owner.md#uc-91) |
| граница | последняя фраза ячейки | [UC-92](../specs/mvp/functions/F-16-owner.md#uc-92) |
| права | доступ не владельца, журнал | [UC-93](../specs/mvp/functions/F-16-owner.md#uc-93) |
| пустое состояние | пустые списки | [UC-94](../specs/mvp/functions/F-16-owner.md#uc-94) |
