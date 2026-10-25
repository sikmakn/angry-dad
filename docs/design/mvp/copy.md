# Тексты интерфейса

## Дополнение финального EDIT · актуальные строки

Ниже ключи для новых состояний. Варианты исправленных ключей основного словаря обновлены на месте. Для конкретных статических сообщений единственный набор соответствий контексту — `historySamples` и `shareSamples` в [viewer.js](viewer.js); они используют фразы основного словаря. Query содержит только известный ключ, не произвольную цитату. При реализации копировать исходную фразу результата и обезличивать название задачи, а не подставлять общий текст карточки.

| ключ | ru | где |
|---|---|---|
| task.recurring.earlier.title | Ранние периоды | task#recurring-earlier, только английский |
| task.recurring.earlier.end | Это все более ранние периоды этой задачи. | task#recurring-earlier |
| task.recurring.extended.quote | Час добавлен. Успевай. | task#rec-extended, образец родителя, оба пола |
| task.recurring.extended.limit | Продление на сегодня использовано. Уважение не изменилось. | task#rec-extended |
| task.recurring.extended.disabled | Больше времени сегодня нет | task#rec-extended, недоступная кнопка |
| task.recurring.edit.hint | Повторяется · каждый день. Меняется только название, периоды и расписание сохраняются. | task#edit-recurring |
| task.pool.edit.hint | Повторяется · вт, чт. Сегодня нет активного периода. Меняется только название. | task#edit-pool |
| battle.history.title | Бой · ответ на сообщение | battle#history-reply |
| battle.history.noTask | Без задачи | history-reply, сообщения без задачи |
| shop.purchase.result | Оплачено {price} Stars. К балансу добавлено {pack} {packUnit}. Теперь: {balance} {balanceUnit}. | shop#battle-positive-ok; pack 1/3/5 → price 15/39/60, формы: 1 удар, 3 удара, 5 ударов; итог по русским правилам 11–14 и последней цифре |
| battle.parent.break.alt | Отец: Батя сломлен и смягчился; мать: Мама сломлена и смягчилась. | battle#break/#norew, aria-label; независимо от пола пользователя |
| battle.parent.norew | Отец: Помню. Зря не пришёл. Я просто хотел как лучше. Опять. Мать: Помню. Зря не пришла. Я просто хотела как лучше. Опять. | battle#norew, карточка ?battle=norew#break; независимо от пола пользователя |
| battle.player.break | Отцу: Ты хотел как лучше. А получилось, что я боюсь тебе звонить. Матери: Ты хотела как лучше. А получилось, что я боюсь тебе звонить. | battle#break; род определяется адресатом |
| share.role | Отец / Мать | видимая роль .leaf-role и доступное описание карточки, независимо от пола пользователя |

## Основной словарь

Единый язык интерфейса: русский. Фразы Бати помечены как образцы из пула, финальные берутся из пула (F-9). Общие подписи меню используют `nav.*`, повтор загрузки — `common.retry`. Варианты роли и пола приведены ниже.

| ключ | ru | где |
|---|---|---|
| start.step | Шаг {n} из 4 | [Старт](screens/start.html) · все шаги, n = 1…4 |
| start.back | Назад | [Старт](screens/start.html) · state gender |
| start.next | Дальше | [Старт](screens/start.html) · parent, parent-chosen, again, again-mother, gender, redirect, condolence, tz-unknown |
| start.parent.title | Выберите Вашего вредного родителя | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown |
| start.parent.father | Отец | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown |
| start.parent.father.sub | Сравнивает, сроки, «в твои годы» | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown |
| start.parent.mother | Мать | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown |
| start.parent.mother.sub | Давит виной: «я для тебя всё…» | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown |
| start.parent.hint | Выберите родителя, чтобы идти дальше. | [Старт](screens/start.html) · parent, tz-unknown (под неактивной «Дальше», aria-describedby) |
| start.terms.line | Продолжая, вы принимаете {условия и политику конфиденциальности}. | [Старт](screens/start.html) · parent, parent-chosen, tz-unknown (ссылка ведёт в state terms) |
| start.terms.link | условия и политику конфиденциальности | [Старт](screens/start.html) · ссылка в start.terms.line |
| start.terms.eyebrow | Условия | [Старт](screens/start.html) · terms |
| start.terms.title | Условия и политика конфиденциальности | [Старт](screens/start.html) · terms |
| start.terms.ai.title | Внешний ИИ | [Старт](screens/start.html) · terms |
| start.terms.ai.body | Тексты ваших задач и реплики в бою передаются внешнему ИИ: он проверяет, что задача конкретная, и отвечает за персонажа. | [Старт](screens/start.html) · terms (R-3) |
| start.terms.full.title | Полный текст | [Старт](screens/start.html) · terms |
| start.terms.full.body | Полный текст условий и политики конфиденциальности размещает владелец продукта. | [Старт](screens/start.html) · terms (заглушка, подставить текст владельца) |
| start.terms.close | Понятно, назад | [Старт](screens/start.html) · terms |
| start.tzunknown.banner | Пояс не определился. Поставили UTC+3 (Москва). Сменить можно в настройках. | [Старт](screens/start.html) · tz-unknown (R-5, UC-3) |
| start.again.father | Снова начинаем. Я не удивлён. | [Старт](screens/start.html) · again (Батя, R-8) |
| start.again.mother | Снова начинаем. Я не удивлена. | [Старт](screens/start.html) · again-mother (Мама, R-8) |
| start.again.note | Старых задач и боёв нет. Уважение начинается с 12. | [Старт](screens/start.html) · again, again-mother |
| start.gender.title | Выберите Ваш пол | [Старт](screens/start.html) · gender, redirect, error |
| start.gender.male | Мужской | [Старт](screens/start.html) · gender, redirect, error |
| start.gender.female | Женский | [Старт](screens/start.html) · gender, redirect, error |
| start.gender.note | От пола зависят окончания: «сам» или «сама». Больше ни от чего. | [Старт](screens/start.html) · gender |
| start.gender.hint | Выберите пол, чтобы идти дальше. | [Старт](screens/start.html) · gender, redirect (под неактивной «Дальше») |
| start.redirect.banner | Сначала закончи начатое. Задачи, бой и остальное откроются после старта. | [Старт](screens/start.html) · redirect (UC-5, UC-17) |
| start.condolence.title | Соболезнуем Вам. Крепитесь… | [Старт](screens/start.html) · condolence |
| start.condolence.note | Передумаете: родителя и пол можно сменить в настройках. | [Старт](screens/start.html) · condolence |
| start.phrase1.male | Опять ничего сам не можешь? Ну, что тебе надо сделать? | [Старт](screens/start.html) · phrases (Батя, пол мужской, R-6) |
| start.phrase1.female | Опять ничего сама не можешь? Ну, что тебе надо сделать? | [Старт](screens/start.html) · phrases-mother (Мама, пол женский, R-4, R-6) |
| start.phrase2 | Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко? | [Старт](screens/start.html) · phrases, phrases-mother (R-6) |
| start.speaker.father | Батя | [Старт](screens/start.html) · подпись реплик, роль «отец» |
| start.speaker.mother | Мама | [Старт](screens/start.html) · подпись реплик, роль «мать» |
| start.phrases.cta | Назвать задачу | [Старт](screens/start.html) · phrases, phrases-mother (переход на task-new) |
| start.tz.title | Обновить часовой пояс? | [Старт](screens/start.html) · tz (UC-4, R-9) |
| start.tz.body | Сохранён {сохранённый} ({город}), а устройство сейчас в {новый} ({город}). По поясу считаются сроки, проверки и тихие часы. | [Старт](screens/start.html) · tz; в макете UTC+3 (Москва) и UTC+4 (Самара) |
| start.tz.accept | Обновить на {новый} | [Старт](screens/start.html) · tz |
| start.tz.keep | Оставить {сохранённый} | [Старт](screens/start.html) · tz |
| start.tz.eyebrow | Главная | [Старт](screens/start.html) · tz (подпись фона, не интерфейса) |
| start.error.banner | Не сохранилось. Выбор на месте, сеть отвалилась. Проверь интернет и нажми «Повторить». | [Старт](screens/start.html) · error |
| tasknew.title | Новая задача | [Постановка задачи](screens/task-new.html) · заголовок, все состояния формы |
| tasknew.title.label | Что нужно сделать | [Постановка задачи](screens/task-new.html) · подпись поля, все состояния формы |
| tasknew.title.placeholder | Например: написать отчёт по продажам | [Постановка задачи](screens/task-new.html) · first, empty |
| tasknew.title.hint | Конкретно: что, сколько, где. | [Постановка задачи](screens/task-new.html) · поле названия |
| tasknew.title.counter | {n}/120 | [Постановка задачи](screens/task-new.html) · счётчик под полем; при 120 красный и с подсказкой |
| tasknew.title.full | Больше не влезет. Лишнее отрезано. | [Постановка задачи](screens/task-new.html) · long (R-18, UC-16) |
| tasknew.title.saved | Название и срок сохранены в форме. | [Постановка задачи](screens/task-new.html) · limit |
| tasknew.title.vaguehint | Не цель, а действие: что именно сделаешь, сколько, где. | [Постановка задачи](screens/task-new.html) · vague |
| tasknew.kind.legend | Как ставим | [Постановка задачи](screens/task-new.html) · first, empty и все формы |
| tasknew.kind.once | До срока | [Постановка задачи](screens/task-new.html) · переключатель вида |
| tasknew.kind.rec | Повторять | [Постановка задачи](screens/task-new.html) · переключатель вида |
| tasknew.when.legend | Срок | [Постановка задачи](screens/task-new.html) · once и другие разовые |
| tasknew.when.today | Сегодня | [Постановка задачи](screens/task-new.html) · кнопка срока |
| tasknew.when.tomorrow | Завтра | [Постановка задачи](screens/task-new.html) · кнопка срока |
| tasknew.when.date | Дата и время | [Постановка задачи](screens/task-new.html) · кнопка срока |
| tasknew.when.hint | «Сегодня» и «Завтра» — до 22:00. Срок от 15 минут до 365 дней. | [Постановка задачи](screens/task-new.html) · once |
| tasknew.when.date.label | Дата | [Постановка задачи](screens/task-new.html) · soon, far |
| tasknew.when.time.label | Время | [Постановка задачи](screens/task-new.html) · soon, far |
| tasknew.when.summary | Срок: {завтра, суббота 24 октября, 22:00} | [Постановка задачи](screens/task-new.html) · once, long, checking |
| tasknew.when.err.today | До конца дня меньше 15 минут. | [Постановка задачи](screens/task-new.html) · today-late (R-21) |
| tasknew.when.err.soon | Срок — не раньше чем через 15 минут. Сейчас {время}. | [Постановка задачи](screens/task-new.html) · soon (R-21) |
| tasknew.when.err.far | Срок — не позже чем через 365 дней. | [Постановка задачи](screens/task-new.html) · far (R-21) |
| tasknew.rec.legend | Как часто | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.daily | Каждый день | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.weekdays | По будням | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.weekly | Раз в неделю | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.days | По выбранным дням | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.n | Каждые N дней | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.rec.weekly.day | День недели | [Постановка задачи](screens/task-new.html) · rec-weekly |
| tasknew.rec.weekly.any | Любой, закрыть можно всю неделю | [Постановка задачи](screens/task-new.html) · rec-weekly (вариант списка) |
| tasknew.rec.weekly.hint | Без дня неделя идёт с понедельника по воскресенье, срок — воскресенье 22:00. | [Постановка задачи](screens/task-new.html) · rec-weekly |
| tasknew.rec.days.legend | Дни недели: от 1 до 6 | [Постановка задачи](screens/task-new.html) · rec-days |
| tasknew.rec.days.short | Пн, Вт, Ср, Чт, Пт, Сб, Вс | [Постановка задачи](screens/task-new.html) · rec-days (кнопки дней) |
| tasknew.rec.days.hint | Все семь дней — это «Каждый день», такой вариант выбирать не нужно. | [Постановка задачи](screens/task-new.html) · rec-days |
| tasknew.rec.n.label | Сколько дней в периоде | [Постановка задачи](screens/task-new.html) · rec-n |
| tasknew.rec.n.err | От 2 до 30 дней. | [Постановка задачи](screens/task-new.html) · rec-n (R-22) |
| tasknew.rec.n.hint | Задачу можно закрыть в любой день периода. «Через день» — это 2. | [Постановка задачи](screens/task-new.html) · rec-n |
| tasknew.anchor.label | Примерно во сколько (необязательно) | [Постановка задачи](screens/task-new.html) · rec-* |
| tasknew.anchor.hint | Ориентир: напоминания пойдут от него. Провал в 22:00, а если ориентир позже, то в ориентир. | [Постановка задачи](screens/task-new.html) · rec-day |
| tasknew.anchor.hint.short | Ориентир: напоминания пойдут от него. Провал в 22:00. | [Постановка задачи](screens/task-new.html) · rec-days |
| tasknew.anchor.hint.none | Без ориентира срок периода — 22:00. | [Постановка задачи](screens/task-new.html) · rec-weekly |
| tasknew.rec.detected | В названии есть «{слова периодичности}». Подставили периодичность. Сохранится после «Поставить». | [Постановка задачи](screens/task-new.html) · rec-day (R-23) |
| tasknew.rec.detected.remove | Убрать | [Постановка задачи](screens/task-new.html) · rec-day |
| tasknew.rec.summary.daily | Каждый день. Ориентир {20:00}, срок периода 22:00. Первый период — сегодня. | [Постановка задачи](screens/task-new.html) · rec-day |
| tasknew.rec.summary.weekly | Раз в неделю, по воскресеньям. Первый период — до воскресенья, 25 октября, 22:00. | [Постановка задачи](screens/task-new.html) · rec-weekly |
| tasknew.rec.summary.days | По вторникам и четвергам. Ориентир 19:00, срок каждого периода 22:00. Первый период — во вторник, 27 октября. | [Постановка задачи](screens/task-new.html) · rec-days |
| tasknew.submit | Поставить | [Постановка задачи](screens/task-new.html) · кнопка, все формы |
| tasknew.submit.retry | Поставить ещё раз | [Постановка задачи](screens/task-new.html) · later |
| tasknew.submit.busy | Батя читает… | [Постановка задачи](screens/task-new.html) · checking (R-25, R-26) |
| tasknew.submit.why | Нужны название и срок или периодичность. | [Постановка задачи](screens/task-new.html) · first, empty (под неактивной кнопкой) |
| tasknew.submit.limitwhy | Ставить и переименовывать задачи снова можно после 00:00. Проверки прогресса продолжаются. | [Постановка задачи](screens/task-new.html) · limit |
| tasknew.first.phrase | Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко? | [Постановка задачи](screens/task-new.html) · first (Батя, R-6) |
| tasknew.today.phrase | Без десяти десять и «сегодня»? Ставь на завтра, там хоть шанс есть. | [Постановка задачи](screens/task-new.html) · today-late (Батя, отказ R-21) |
| tasknew.soon.phrase | Через десять минут? Это не срок, это отмазка. Дай хотя бы четверть часа. | [Постановка задачи](screens/task-new.html) · soon (Батя, отказ R-21) |
| tasknew.far.phrase | Через год? До пятницы сначала доживи. | [Постановка задачи](screens/task-new.html) · far (Батя, отказ R-21) |
| tasknew.vague.phrase | Это что за задача? Конкретно. | [Постановка задачи](screens/task-new.html) · vague (Батя, onVague, R-25) |
| tasknew.limit.phrase | Хватит на сегодня. Приходи завтра. | [Постановка задачи](screens/task-new.html) · limit (Батя, R-28) |
| tasknew.later.banner | Попробуй позже. Не удалось прочитать название. Задача не поставлена, всё введённое на месте. | [Постановка задачи](screens/task-new.html) · later (R-26) |
| tasknew.success.eyebrow | Дневник · {день недели, дата} | [Постановка задачи](screens/task-new.html) · success, success-rec |
| tasknew.success.phrase | Записал. Не подведи. | [Постановка задачи](screens/task-new.html) · success (Батя, onTaskSet) |
| tasknew.success.phrase.rec | Записал. Каждый день, без выходных на лень. | [Постановка задачи](screens/task-new.html) · success-rec (Батя, onTaskSet) |
| tasknew.success.kind.once | Разовая | [Постановка задачи](screens/task-new.html) · success |
| tasknew.success.kind.rec | Повторяется: {периодичность} | [Постановка задачи](screens/task-new.html) · success-rec |
| tasknew.success.size.micro | Микро-задача | [Постановка задачи](screens/task-new.html) · success (размер, R-134) |
| tasknew.success.size.medium | Средняя задача | [Постановка задачи](screens/task-new.html) · success (размер, R-134) |
| tasknew.success.size.large | Большая задача | [Постановка задачи](screens/task-new.html) · success (размер, R-134) |
| tasknew.success.deadline | Срок: {завтра, суббота 24 октября, 22:00} | [Постановка задачи](screens/task-new.html) · success |
| tasknew.success.anchor | Ориентир: {20:00}. Срок сегодняшнего периода: {22:00}. | [Постановка задачи](screens/task-new.html) · success-rec |
| tasknew.success.sizenote | Размер определён при постановке, поменять его нельзя. За закрытие: +{1 / 3 / 5} к уважению. | [Постановка задачи](screens/task-new.html) · success |
| tasknew.success.sizenote.rec | Размер один на все периоды. За каждый закрытый период: +{1 / 3 / 5} к уважению. | [Постановка задачи](screens/task-new.html) · success-rec |
| tasknew.success.checks | Проверки начнутся не раньше чем через 3 минуты. Когда — Батя не скажет. | [Постановка задачи](screens/task-new.html) · success |
| tasknew.success.home | К задачам | [Постановка задачи](screens/task-new.html) · success, success-rec |
| tasknew.success.another | Поставить ещё одну | [Постановка задачи](screens/task-new.html) · success, success-rec |
| home.eyebrow | Дневник · {день недели, дата} | [Главная](screens/home.html) · все состояния |
| home.respect.label | Уважение | [Главная](screens/home.html) · карточка уважения |
| home.respect.value | {n} из 100 | [Главная](screens/home.html) · карточка уважения (целая часть, R-66) |
| home.respect.note | Выше 94 — только если сломать Батю в бою. | [Главная](screens/home.html) · normal |
| home.new | Новая задача | [Главная](screens/home.html) · кнопка, normal, check, many |
| home.empty.cta | Поставить задачу | [Главная](screens/home.html) · empty (UC-25) |
| home.list.title | Активные задачи · {n} | [Главная](screens/home.html) · normal, check, many |
| home.list.sort | Сверху те, у кого срок ближе | [Главная](screens/home.html) · normal, many |
| home.list.open | Нажми на задачу, чтобы открыть её. | [Главная](screens/home.html) · normal |
| home.task.once | Разовая | [Главная](screens/home.html) · карточка задачи |
| home.task.rec | Повторяется · {периодичность} | [Главная](screens/home.html) · карточка задачи; сокращённо в many: «Каждый день», «По будням», «Каждые 3 дня», «Раз в неделю · вс» |
| home.task.timer | {1 ч 00 мин} до срока · {сегодня, 17:00} | [Главная](screens/home.html) · разовая |
| home.task.timer.period | {6 ч 00 мин} до срока периода · {22:00}, ориентир {20:00} | [Главная](screens/home.html) · повторяющаяся с активным периодом |
| home.task.timer.short | {1 д 6 ч} · {завтра, 22:00} | [Главная](screens/home.html) · many (сжатая запись) |
| home.task.asked | Ждёт ответа на проверку | [Главная](screens/home.html) · check (метка на карточке) |
| home.task.idle.rec | Сегодня не твой день. Следующий период — во вторник, 27 октября. | [Главная](screens/home.html) · повторяющаяся без активного периода (UC-31) |
| home.task.closedtoday | Сегодня закрыто | [Главная](screens/home.html) · повторяющаяся, период закрыт |
| home.task.closedtoday.note | Следующий период начнётся в 00:00. | [Главная](screens/home.html) · повторяющаяся, период закрыт |
| home.mood.aria | Настроение: {название}, {n} из 5 | [Главная](screens/home.html) · шкала настроения (aria-label) |
| home.mood.neutral | Спокоен | [Главная](screens/home.html) · уровень 1, neutral (мать: Спокойна) |
| home.mood.watching | Присматривается | [Главная](screens/home.html) · уровень 2, watching |
| home.mood.annoyed | Раздражён | [Главная](screens/home.html) · уровень 3, annoyed (мать: Раздражена) |
| home.mood.angry | Зол | [Главная](screens/home.html) · уровень 4, angry (мать: Зла) |
| home.mood.very_angry | В ярости | [Главная](screens/home.html) · уровень 5, very_angry |
| home.check.phrase | Покажи, что сделано. Две минуты. | [Главная](screens/home.html) · check (Батя, onCheckIn) |
| home.check.note | Спросил в {15:47} про «{название}». Без ответа 15 минут — минус 1 к уважению. | [Главная](screens/home.html) · check |
| home.check.cta | Ответить на проверку | [Главная](screens/home.html) · check |
| home.empty.phrase | Задач нет. Подозрительно. Ставь, пока я не придумал тебе сам. | [Главная](screens/home.html) · empty (Батя, UC-25) |
| home.empty.how | Напиши, что нужно сделать, и к какому сроку или как часто. Расплывчатое («стать лучше») не примут. Проверки, напоминания и упрёки начнутся, как только задача появится. | [Главная](screens/home.html) · empty |
| home.error.banner | Не загрузилось. Задачи на месте, а вот связь с Батей нет. Проверь интернет и нажми «Повторить». | [Главная](screens/home.html) · error |
| task.back | ← Задачи | [Страница задачи](screens/task.html) · все состояния |
| task.edit | Изменить название | [Страница задачи](screens/task.html) · active, extended, denied, recurring, recurring-idle |
| task.tag.once | Разовая | [Страница задачи](screens/task.html) · теги |
| task.tag.rec | Повторяется · {периодичность} | [Страница задачи](screens/task.html) · теги, recurring, recurring-idle, rec-denied |
| task.tag.stopped | Остановлена | [Страница задачи](screens/task.html) · stopped |
| task.tag.stopped.rec | Повторялась · {периодичность} | [Страница задачи](screens/task.html) · stopped |
| task.tag.done | Закрыта | [Страница задачи](screens/task.html) · done, check-closed |
| task.tag.failed | Провалена | [Страница задачи](screens/task.html) · failed |
| task.tag.asked | Ждёт ответа на проверку | [Страница задачи](screens/task.html) · check |
| task.size.micro | Микро-задача | [Страница задачи](screens/task.html) · теги (R-134) |
| task.size.medium | Средняя задача | [Страница задачи](screens/task.html) · теги (R-134) |
| task.size.large | Большая задача | [Страница задачи](screens/task.html) · теги (R-134) |
| task.fact.deadline | Срок | [Страница задачи](screens/task.html) · active, extended, denied, edit |
| task.fact.deadline.was | Срок был | [Страница задачи](screens/task.html) · done, failed, late |
| task.fact.left | Осталось | [Страница задачи](screens/task.html) · active, check, extended, denied, recurring |
| task.fact.mood | Настроение | [Страница задачи](screens/task.html) · active, check, extended, denied, recurring |
| task.fact.reward | Закроешь | [Страница задачи](screens/task.html) · active, extended (разовая) |
| task.fact.penalty | Провалишь | [Страница задачи](screens/task.html) · active, extended (разовая) |
| task.fact.reward.value | +{1 / 3 / 5} к уважению | [Страница задачи](screens/task.html) · по размеру задачи (R-134, D24) |
| task.fact.penalty.value | −2 к уважению | [Страница задачи](screens/task.html) · разовая и период |
| task.fact.period | Период | [Страница задачи](screens/task.html) · recurring |
| task.fact.anchor | Ориентир | [Страница задачи](screens/task.html) · recurring, rec-denied |
| task.fact.perioddeadline | Срок периода | [Страница задачи](screens/task.html) · recurring, rec-denied |
| task.fact.reward.period | Закроешь период | [Страница задачи](screens/task.html) · recurring |
| task.fact.penalty.period | Провалишь период | [Страница задачи](screens/task.html) · recurring |
| task.fact.closed | Закрыта | [Страница задачи](screens/task.html) · done, check-closed |
| task.fact.how | Как | [Страница задачи](screens/task.html) · done, failed, late |
| task.fact.how.done | кнопкой «Готово» | [Страница задачи](screens/task.html) · done, check-closed (closedBy = done_button; для check_in: «ответом «Сделано» на проверку») |
| task.fact.how.deadline | срок вышел | [Страница задачи](screens/task.html) · failed, late (closedBy = deadline; для give_up: «сдалась / сдался сам») |
| task.fact.respect | Уважение | [Страница задачи](screens/task.html) · done, failed, late, check-closed |
| task.fact.wasdeadline | (был {17:00}) | [Страница задачи](screens/task.html) · extended |
| task.mood.aria | Настроение: {название}, {n} из 5 | [Страница задачи](screens/task.html) · шкала настроения (aria-label) |
| task.mood.neutral / watching / annoyed / angry / very_angry | Спокоен / Присматривается / Раздражён / Зол / В ярости | [Страница задачи](screens/task.html) · шкала настроения (мать: Спокойна / Присматривается / Раздражена / Зла / В ярости) |
| task.done | Готово | [Страница задачи](screens/task.html) · основная кнопка, active, extended, denied, recurring, rec-denied |
| task.more | Мне нужно больше времени… | [Страница задачи](screens/task.html) · active, check, extended, denied, recurring, rec-denied |
| task.more.hint | Срок сдвигается на 1 час, один раз в сутки. Другого способа сдвинуть срок нет. | [Страница задачи](screens/task.html) · active |
| task.more.hint.used | Сегодня час уже взят. Следующий — после 00:00. | [Страница задачи](screens/task.html) · extended |
| task.more.hint.denied | Срок остался прежним. Продление снова будет доступно после 00:00. | [Страница задачи](screens/task.html) · denied |
| task.more.hint.rec | Срок не изменился: с продлением он ушёл бы на следующие сутки. | [Страница задачи](screens/task.html) · rec-denied (R-44) |
| task.giveup | Сдаюсь | [Страница задачи](screens/task.html) · active, check, extended, denied, recurring, rec-denied |
| task.giveup.hint.rec | Проваливает только сегодняшний период. Задача остаётся. | [Страница задачи](screens/task.html) · recurring |
| task.done.hint.rec | Закрывает только сегодняшний период. Завтра Батя спросит снова. | [Страница задачи](screens/task.html) · recurring |
| task.delete | Удалить задачу | [Страница задачи](screens/task.html) · active, check, extended, denied, recurring, recurring-idle, stopped, done, failed, late |
| task.stop | Остановить задачу | [Страница задачи](screens/task.html) · recurring, recurring-idle |
| task.excuse.phrase | Час. Ровно час. Не два и не «до завтра». | [Страница задачи](screens/task.html) · extended (Батя, onExcuse, R-33) |
| task.excuse.denied | Один час в сутки. Свой ты уже взял. Дальше сам. | [Страница задачи](screens/task.html) · denied (Батя, onExcuseDenied, R-33) |
| task.excuse.denied.rec | Продлевать некуда: дальше уже завтра. Успевай сегодня. | [Страница задачи](screens/task.html) · rec-denied (Батя, onExcuseDenied, R-44) |
| task.check.title | Проверка | [Страница задачи](screens/task.html) · check, check-closed |
| task.check.phrase | Покажи, что сделано. Две минуты. | [Страница задачи](screens/task.html) · check, check-closed (Батя, onCheckIn) |
| task.check.note | Спросил в {15:47}. Без ответа до {16:02} — минус 1 к уважению. | [Страница задачи](screens/task.html) · check |
| task.check.done | Сделано | [Страница задачи](screens/task.html) · check |
| task.check.partial | Частично | [Страница задачи](screens/task.html) · check |
| task.check.notstarted | Не начинал | [Страница задачи](screens/task.html) · check (женский пол: Не начинала) |
| task.check.hint | «Сделано» закрывает задачу: +{1 / 3 / 5}. «Частично» и «Не начинал» уважение не меняют, но Батя спросит ещё раз. | [Страница задачи](screens/task.html) · check |
| task.check.closed | Задача уже закрыта. Штрафа за молчание нет. | [Страница задачи](screens/task.html) · check-closed (R-53) |
| task.edit.title | Название задачи | [Страница задачи](screens/task.html) · edit, edit-vague, edit-later, edit-limit |
| task.edit.label | Что нужно сделать | [Страница задачи](screens/task.html) · edit* |
| task.edit.hint | Меняется только название. Срок сдвигается кнопкой «Мне нужно больше времени…». | [Страница задачи](screens/task.html) · edit |
| task.edit.deadline.label | Срок | [Страница задачи](screens/task.html) · edit (поле недоступно, R-36) |
| task.edit.counter | {n}/120 | [Страница задачи](screens/task.html) · edit* |
| task.edit.save | Сохранить | [Страница задачи](screens/task.html) · edit, edit-vague, edit-limit |
| task.edit.save.retry | Сохранить ещё раз | [Страница задачи](screens/task.html) · edit-later |
| task.edit.cancel | Отмена | [Страница задачи](screens/task.html) · edit* |
| task.edit.vague.phrase | Это что за задача? Конкретно. | [Страница задачи](screens/task.html) · edit-vague (Батя, onVague) |
| task.edit.vague.hint | Прежнее название остаётся, пока не напишешь конкретно. | [Страница задачи](screens/task.html) · edit-vague |
| task.edit.later | Попробуй позже. Не удалось прочитать название. Название не изменено, твой текст на месте. | [Страница задачи](screens/task.html) · edit-later (R-26) |
| task.edit.later.hint | Меняется только название. | [Страница задачи](screens/task.html) · edit-later |
| task.edit.limit.phrase | Хватит на сегодня. Приходи завтра. | [Страница задачи](screens/task.html) · edit-limit (Батя, R-28) |
| task.edit.limit.hint | Ставить и переименовывать задачи снова можно после 00:00. Проверки прогресса продолжаются. | [Страница задачи](screens/task.html) · edit-limit |
| task.giveup.confirm.title | Сдаёшься? | [Страница задачи](screens/task.html) · confirm-giveup |
| task.giveup.confirm.body | Задача станет проваленной, уважение упадёт на 1: с {14} до {13}. Вернуть снятое нельзя, Батя запишет в дневник. | [Страница задачи](screens/task.html) · confirm-giveup (R-32) |
| task.giveup.confirm.yes | Да, сдаюсь | [Страница задачи](screens/task.html) · confirm-giveup |
| task.giveup.confirm.no | Нет, продолжу | [Страница задачи](screens/task.html) · confirm-giveup |
| task.delete.confirm.title | Удалить задачу? | [Страница задачи](screens/task.html) · confirm-delete |
| task.delete.confirm.body | Она исчезнет из списка и истории. Если задача закрыта, пропадёт и из рейтинга. Уважение останется как есть. | [Страница задачи](screens/task.html) · confirm-delete (R-35) |
| task.delete.confirm.yes | Удалить | [Страница задачи](screens/task.html) · confirm-delete |
| task.delete.confirm.no | Не удалять | [Страница задачи](screens/task.html) · confirm-delete |
| task.stop.confirm.title | Остановить задачу? | [Страница задачи](screens/task.html) · confirm-stop |
| task.stop.confirm.body | Новые периоды открываться не будут, проверки и напоминания прекратятся. Уважение не изменится. Прошлые периоды останутся в списке. | [Страница задачи](screens/task.html) · confirm-stop (R-45) |
| task.stop.confirm.yes | Остановить | [Страница задачи](screens/task.html) · confirm-stop |
| task.stop.confirm.no | Пусть идёт | [Страница задачи](screens/task.html) · confirm-stop |
| task.periods.title | Периоды | [Страница задачи](screens/task.html) · recurring, recurring-idle, stopped |
| task.periods.today | Сегодня, {пт 23 окт.} | [Страница задачи](screens/task.html) · recurring |
| task.periods.active | Идёт · до {22:00} | [Страница задачи](screens/task.html) · recurring |
| task.periods.done | Закрыт | [Страница задачи](screens/task.html) · recurring, recurring-idle, stopped |
| task.periods.failed | Провален | [Страница задачи](screens/task.html) · recurring, recurring-idle, stopped |
| task.periods.more | Показать более ранние | [Страница задачи](screens/task.html) · recurring |
| task.idle.title | Сегодня не твой день. Проверок и напоминаний нет. | [Страница задачи](screens/task.html) · recurring-idle (UC-31) |
| task.idle.next | Следующий период — {вторник, 27 октября}. Срок {22:00}, ориентир {19:00}. | [Страница задачи](screens/task.html) · recurring-idle |
| task.stopped.note | Новых периодов не будет, сообщений по задаче нет. | [Страница задачи](screens/task.html) · stopped |
| task.failed.stamp | Задача провалена | [Страница задачи](screens/task.html) · failed, late |
| task.failed.review | К разбору провала | [Страница задачи](screens/task.html) · failed |
| task.late.toast | Задача уже провалена. | [Страница задачи](screens/task.html) · late (R-37) |
| task.late.review | К разбору: «Сделаю за час» | [Страница задачи](screens/task.html) · late |
| task.missing.title | Такой задачи нет | [Страница задачи](screens/task.html) · missing (UC-24) |
| task.missing.body | Её удалили, или она не твоя. Чужие задачи здесь не открываются. | [Страница задачи](screens/task.html) · missing |
| task.missing.cta | К моим задачам | [Страница задачи](screens/task.html) · missing |
| task.error.banner | Не загрузилось. Задача никуда не делась, просто Батя не дозвонился. Проверь интернет и нажми «Повторить». | [Страница задачи](screens/task.html) · error |
| `done.title` | Готово | [Готово](screens/done.html) · h1, виден только скринридеру |
| `done.eyebrow` | Дневник · {когда}, {время} | [Готово](screens/done.html) · над названием; пример: «сегодня, 17:02», «понедельник, 12:00» |
| `done.tag.ok` | ✓ Выполнено | [Готово](screens/done.html) · метка статуса |
| `done.tag.size` | Размер: {size} | [Готово](screens/done.html) · метка размера задачи |
| `done.size.micro` | микро | [Готово](screens/done.html) · значение размера |
| `done.size.medium` | средняя | [Готово](screens/done.html) · значение размера |
| `done.size.large` | большая | [Готово](screens/done.html) · значение размера |
| `done.tag.daily` | Каждый день | [Готово](screens/done.html) · метка периодичности, повторяющаяся задача |
| `done.tag.weekdays` | По будням | [Готово](screens/done.html) · метка периодичности, повторяющаяся задача |
| `done.period.title` | {название} · {день недели} | [Готово](screens/done.html) · название периода повторяющейся задачи, пример: «Повторять английский · понедельник» |
| `done.quote.micro` | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | [Готово](screens/done.html) · фраза onSuccess, микро, образец |
| `done.quote.medium` | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | [Готово](screens/done.html) · фраза onSuccess, средняя, образец |
| `done.quote.large` | Большое дело, и ничего не развалил. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко. | [Готово](screens/done.html) · фраза onSuccess, большая, образец |
| `done.quote.cap` | Сдал. Что ж, и такое бывает. Дальше сам. | [Готово](screens/done.html) · фраза onSuccess, потолок 94, образец |
| `done.quote.daily` | Сегодня сделал. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь. | [Готово](screens/done.html) · фраза onSuccess, повторяющаяся (день), образец |
| `done.quote.weekdays` | Почта разобрана. Только не говори, что это был труд. Это была почта. | [Готово](screens/done.html) · фраза onSuccess, повторяющаяся (по будням), образец |
| `done.who.father` | Батя | [Готово](screens/done.html) · подпись под фразой |
| `done.who.mother` | Мама | [Готово](screens/done.html) · подпись под фразой |
| `done.respect` | Уважение | [Готово](screens/done.html) · строка изменения |
| `done.respect.delta` | {+n} | [Готово](screens/done.html) · изменение уважения, применённое после потолков, пример: +3 |
| `done.respect.range` | {до} → {после} | [Готово](screens/done.html) · значения уважения до и после, целая часть, пример: 12 → 15 |
| `done.new` | Новая задача | [Готово](screens/done.html) · главная кнопка, ведёт к постановке задачи |
| `done.share` | Поделиться | [Готово](screens/done.html) · вторая кнопка, открывает карточку |
| `done.reward.note` | Награда зависит от размера задачи: микро +1, средняя +3, большая +5. | [Готово](screens/done.html) · подпись под кнопками |
| `done.cap.note` | За большую задачу положено +5, засчитан +1: выше 94 уважение растёт только если сломать Батю в бою. | [Готово](screens/done.html) · подпись, состояние «Потолок 94»; числа и роль подставляются |
| `done.cap.battle` | Сломать Батю | [Готово](screens/done.html) · текстовая кнопка, ведёт в бой |
| `done.next.label` | Следующий период | [Готово](screens/done.html) · карточка следующего периода |
| `done.next.when` | {день недели}, срок до {время} | [Готово](screens/done.html) · карточка следующего периода, пример: «вторник, срок до 22:00» |
| `done.next.quiet` | До {дня недели} Батя по этой задаче молчит: ни проверок, ни напоминаний. | [Готово](screens/done.html) · карточка следующего периода, ежедневная; день недели в родительном падеже: «вторника» |
| `done.next.weekend` | В выходные по этой задаче сообщений нет. | [Готово](screens/done.html) · карточка следующего периода, «по будням» в пятницу |
| `done.late.title` | Задача уже провалена. | [Готово](screens/done.html) · баннер, жирное начало, состояние «Опоздал» |
| `done.late.body` | «Готово» в {время нажатия} при сроке {срок} не принимается. Уважение не меняется, снятое за провал не возвращается. | [Готово](screens/done.html) · баннер |
| `done.late.titleSr` | Готово не принято | [Готово](screens/done.html) · h1, виден только скринридеру |
| `done.late.hour` | Сделаю за час | [Готово](screens/done.html) · главная кнопка, состояние «Опоздал» |
| `done.late.fail` | Смотреть провал | [Готово](screens/done.html) · вторая кнопка, ведёт на экран «Провал» |
| `done.late.note` | «Сделаю за час» работает один раз на задачу. Если час уже брал, остаётся только новая задача. | [Готово](screens/done.html) · подпись |
| `done.error.titleSr` | Готово не загрузилось | [Готово](screens/done.html) · h1, виден только скринридеру |
| `done.error.body` | Не загрузилось. Не вышло узнать, чем закончилась задача: сеть отвалилась. Проверь интернет и нажми «Повторить». | [Готово](screens/done.html) · ошибка загрузки, «Не загрузилось.» жирным |
| `fail.eyebrow` | Дневник · сегодня, 22:00 | [Провал](screens/fail.html) · заголовок экрана |
| `fail.stamp` | Задача провалена | [Провал](screens/fail.html) · штамп, регистр верхний через CSS |
| `fail.quote.deadline` | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | [Провал](screens/fail.html) · фраза onFail, пример |
| `fail.quote.surrender` | Сам сдался, сам и расскажешь, почему. Гараж подождёт. Он привык. | [Провал](screens/fail.html) · фраза после «Сдаюсь» |
| `fail.quote.hour-used` | Час тебе давали. Час прошёл, отчёта нет. Дважды я одно и то же не повторяю. | [Провал](screens/fail.html) · фраза при повторном провале после «Сделаю за час» |
| `fail.respect` | Уважение | [Провал](screens/fail.html) · строка изменения |
| `fail.hour` | Сделаю за час | [Провал](screens/fail.html) · кнопка |
| `fail.hour.note` | «Сделаю за час» работает один раз на задачу. Снятое уважение не возвращается. | [Провал](screens/fail.html) · подпись |
| `fail.hour.used` | Час по этой задаче уже был. Теперь только новая задача. | [Провал](screens/fail.html) · подпись при неактивной кнопке |
| `fail.reply` | Ответить | [Провал](screens/fail.html) · кнопка, открывает бой |
| `fail.share` | Поделиться провалом | [Провал](screens/fail.html) · кнопка |
| `fail.period.note` | Провален только вторник. Задача «Каждый день» остаётся, среда начнётся в 00:00. | [Провал](screens/fail.html) · подпись у периода |
| `error.load` | Не загрузилось. Бате не до тебя, сеть тоже отвалилась. Проверь интернет и нажми «Повторить». | [Провал](screens/fail.html) · ошибка загрузки |
| `battle.eyebrow` | Бой | [Бой](screens/battle.html) · над заголовком |
| `battle.title.father` | Батя | [Бой](screens/battle.html) · h1, роль «отец» |
| `battle.title.mother` | Мама | [Бой](screens/battle.html) · h1, роль «мать» |
| `battle.share` | Поделиться | [Бой](screens/battle.html) · текстовая кнопка в шапке, открывает карточку |
| `battle.mode.aggression` | Давит в полную силу | [Бой](screens/battle.html) · подпись режима, побеждённость меньше 40 |
| `battle.mode.defense` | Огрызается | [Бой](screens/battle.html) · подпись режима, от 40 до 70 включительно |
| `battle.mode.confusion` | Сбит с толку | [Бой](screens/battle.html) · подпись режима, больше 70 до 90 включительно (у мамы: «Сбита с толку») |
| `battle.mode.softening` | Смягчился | [Бой](screens/battle.html) · подпись режима, больше 90 (у мамы: «Смягчилась») |
| `battle.mode.broken` | Сломлен | [Бой](screens/battle.html) · подпись режима при побеждённости 100 (у мамы: «Сломлена») |
| `battle.face.aggression` | {роль} давит в полную силу | [Бой](screens/battle.html) · подпись аватара для скринридера |
| `battle.face.defense` | {роль} огрызается | [Бой](screens/battle.html) · подпись аватара для скринридера |
| `battle.face.confusion` | {роль} сбит с толку | [Бой](screens/battle.html) · подпись аватара для скринридера |
| `battle.face.softening` | {роль} смягчился | [Бой](screens/battle.html) · подпись аватара для скринридера |
| `battle.face.broken` | {роль} сломлен и смягчился | [Бой](screens/battle.html) · подпись аватара для скринридера |
| `battle.scale.respect` | Уважение | [Бой](screens/battle.html) · подпись шкалы, целая часть значения |
| `battle.scale.defeat` | Побеждённость | [Бой](screens/battle.html) · подпись шкалы, значение 0–100, отметки 40, 70, 90 под шкалой |
| `battle.scale.delta` | +{n} | [Бой](screens/battle.html) · метка изменения после хода, пример: +22 |
| `battle.scale.recoverNote` | Побеждённость сама снижается на 25 в сутки, пока ты не бьёшь. Уважение не откатывается. | [Бой](screens/battle.html) · подпись, состояние «После отката» |
| `battle.balance` | Удары: | [Бой](screens/battle.html) · баланс ударов, значение рядом |
| `battle.balance.buy` | Купить | [Бой](screens/battle.html) · кнопка рядом с балансом, ведёт в магазин |
| `battle.log.father` | Диалог с Батей | [Бой](screens/battle.html) · подпись истории для скринридера |
| `battle.log.mother` | Диалог с мамой | [Бой](screens/battle.html) · подпись истории для скринридера |
| `battle.who.you` | Ты | [Бой](screens/battle.html) · подпись реплики пользователя |
| `battle.who.father` | Батя | [Бой](screens/battle.html) · подпись реплики персонажа |
| `battle.who.mother` | Мама | [Бой](screens/battle.html) · подпись реплики персонажа |
| `battle.taskmark` | К задаче: {название} | [Бой](screens/battle.html) · пометка задачи над репликой персонажа из «Ответить» (R-87) |
| `battle.start.sample` | Ну что, пришёл разговаривать? Я слушаю. Недолго. | [Бой](screens/battle.html) · реплика onBattleStart, пустой диалог, образец |
| `battle.sample.feed1` | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | [Бой](screens/battle.html) · реплика из «Ответить» на провал, образец |
| `battle.sample.feed2` | Гараж не убран, а языком ты работаешь исправно. Давай, оправдывайся. | [Бой](screens/battle.html) · реплика из «Ответить», образец |
| `battle.sample.feed3` | Позвонила бабушке? Она спрашивала, почему ты не звонишь. Я, конечно, промолчала. Я же мать. | [Бой](screens/battle.html) · реплика матери из «Ответить», образец |
| `battle.sample.aggression` | Про отчёт надо было говорить до срока. Сейчас говорят только те, кому нечего показать. | [Бой](screens/battle.html) · ответ актёра, aggression, образец |
| `battle.sample.defense` | Ты на отца не огрызайся. Я эту семью кормил, пока ты в песочнице сидел. Равные условия ему подавай. | [Бой](screens/battle.html) · ответ актёра, defense, образец |
| `battle.sample.confusion` | Погоди. Я не кричал. Я повышал голос. Это другое. Ты к чему вообще клонишь? | [Бой](screens/battle.html) · ответ актёра, confusion, образец |
| `battle.sample.softening` | Может, и боюсь. Не говори никому. Ладно. Неплохо у тебя получается. | [Бой](screens/battle.html) · ответ актёра, softening, образец |
| `battle.sample.break` | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | [Бой](screens/battle.html) · финальная реплика onBreak, образец |
| `battle.sample.recovery` | Явился. Отдохнул я, пока тебя не было, и снова за своё. Что у тебя с задачами? | [Бой](screens/battle.html) · ответ актёра по указанию onRecovery, образец |
| `battle.sample.mother` | Двадцать минут бабушке, а матери «некогда». Ладно, я не обижаюсь. Я привыкла. | [Бой](screens/battle.html) · ответ актёра, мать, образец |
| `battle.howto.title` | Как это работает | [Бой](screens/battle.html) · карточка пустого диалога |
| `battle.howto.body` | Пиши по делу: Батя засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и Батя сломлен. | [Бой](screens/battle.html) · карточка пустого диалога |
| `battle.input.label` | Твоя реплика | [Бой](screens/battle.html) · подпись поля |
| `battle.input.placeholder` | Попробуй возразить по делу. Крик не считается. | [Бой](screens/battle.html) · подсказка в пустом поле |
| `battle.input.placeholderSoft` | Бой продолжается: Батя смягчён, но слушает. | [Бой](screens/battle.html) · подсказка в поле после слома |
| `battle.input.hint` | Минимум 2 символа. Реплика стоит 1 удар. | [Бой](screens/battle.html) · подсказка под полем |
| `battle.input.hintBusy` | Пока Батя отвечает, новую реплику не отправить. | [Бой](screens/battle.html) · подсказка под полем, ход в обработке |
| `battle.input.hintZero` | Ударов нет. Текст сохранён: купи удар и отправь. | [Бой](screens/battle.html) · подсказка под полем, нулевой баланс |
| `battle.input.hintLimit` | Больше 300 символов не поместится. | [Бой](screens/battle.html) · подсказка под полем, предел |
| `battle.input.errShort` | Слишком коротко: нужно минимум 2 символа. Удар не списан. | [Бой](screens/battle.html) · ошибка поля |
| `battle.input.counter` | {n} / 300 | [Бой](screens/battle.html) · счётчик символов |
| `battle.send` | Отправить | [Бой](screens/battle.html) · кнопка отправки |
| `battle.send.price` | 1 удар | [Бой](screens/battle.html) · цена в кнопке отправки |
| `battle.send.busy` | Батя отвечает… | [Бой](screens/battle.html) · заблокированная кнопка, ход в обработке |
| `battle.buy` | Купить удары | [Бой](screens/battle.html) · кнопка вместо «Отправить» при нулевом балансе, ведёт в магазин |
| `battle.sending` | Отправляется… | [Бой](screens/battle.html) · пометка под репликой пользователя, ход в обработке |
| `battle.typing` | Батя печатает… | [Бой](screens/battle.html) · индикатор ответа, ход в обработке |
| `battle.turn.summary` | Ход засчитан. Побеждённость {до} → {после}, уважение {до} → {после}. | [Бой](screens/battle.html) · строка итога хода после ответа |
| `battle.break.stamp` | Батя сломлен | [Бой](screens/battle.html) · штамп, регистр верхний через CSS |
| `battle.break.body` | Уважение +12: {до} → {после}. Батя на несколько дней мягче, проверки реже. | [Бой](screens/battle.html) · карточка слома, награда начислена |
| `battle.break.noReward` | В этот раз уважение без прибавки: награда за слом даётся не чаще раза в 3 суток. | [Бой](screens/battle.html) · карточка слома, награда не начислена |
| `battle.break.share` | Поделиться | [Бой](screens/battle.html) · главная кнопка карточки слома |
| `battle.turnErr.title` | Ход не засчитан, удар возвращён. | [Бой](screens/battle.html) · баннер ошибки хода, жирное начало (R-94) |
| `battle.turnErr.timeout` | Батя не ответил за 30 секунд. Шкалы остались прежними, реплика на месте: отправь ещё раз. | [Бой](screens/battle.html) · баннер, таймаут или сбой судьи |
| `battle.turnErr.refusal` | Нейросеть отказалась отвечать на такую реплику. Скажи то же другими словами и отправь ещё раз. | [Бой](screens/battle.html) · баннер, отказ провайдера ИИ |
| `battle.loading.title` | Бой | [Бой](screens/battle.html) · h1, виден только скринридеру, загрузка и ошибка загрузки |
| `battle.error.title` | Не загрузилось. | [Бой](screens/battle.html) · баннер ошибки, жирное начало |
| `battle.error.body` | Батя ждёт, но диалог не открылся: сеть отвалилась. История цела. Проверь интернет и нажми «Повторить». | [Бой](screens/battle.html) · баннер ошибки |
| `history.eyebrow` | Дневник | [История](screens/history.html) · над заголовком |
| `history.title` | История | [История](screens/history.html) · h1 |
| `history.lead` | Всё, что Батя тебе сказал, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя. | [История](screens/history.html) · под заголовком |
| `history.lead.short` | Всё, что Батя тебе сказал, от новых к старым. | [История](screens/history.html) · под заголовком, пустое состояние |
| `history.who.father` | Батя | [История](screens/history.html) · подпись в шапке сообщения |
| `history.who.mother` | Мама | [История](screens/history.html) · подпись в шапке сообщения |
| `history.cat.reminder` | Напоминание | [История](screens/history.html) · метка категории onReminder |
| `history.cat.checkIn` | Проверка | [История](screens/history.html) · метка категории onCheckIn |
| `history.cat.checkInMissed` | Молчание на проверку | [История](screens/history.html) · метка категории onCheckInMissed |
| `history.cat.fail` | Провал | [История](screens/history.html) · метка категории onFail, красная |
| `history.cat.absent` | Давно не заходил | [История](screens/history.html) · метка категории onAbsent |
| `history.cat.success` | Похвала | [История](screens/history.html) · метка категории onSuccess |
| `history.cat.taskSet` | Задача принята | [История](screens/history.html) · метка категории onTaskSet |
| `history.cat.start` | Старт | [История](screens/history.html) · метка стартовых фраз |
| `history.cat.delete` | Задача удалена | [История](screens/history.html) · метка категории onDelete |
| `history.cat.excuse` | Продление | [История](screens/history.html) · метка категорий onExcuse, onExcuseDenied |
| `history.cat.retry` | Ещё час | [История](screens/history.html) · метка категории onRetry |
| `history.cat.vague` | Не конкретно | [История](screens/history.html) · метка категории onVague |
| `history.cat.checkInReply` | Ответ на проверку | [История](screens/history.html) · метка категории onCheckInReply |
| `history.time.today` | Сегодня, {время} | [История](screens/history.html) · дата сообщения |
| `history.time.yesterday` | Вчера, {время} | [История](screens/history.html) · дата сообщения |
| `history.time.date` | {день} {месяц}, {время} | [История](screens/history.html) · дата сообщения, пример: «21 октября, 17:45» |
| `history.task` | Задача: {название} | [История](screens/history.html) · строка задачи в сообщении, `FeedMessage.taskTitle` |
| `history.checkin.answer` | Ты ответил: {ответ} | [История](screens/history.html) · строка ответа на проверку (`checkIn.answer`) |
| `history.checkin.done` | сделано | [История](screens/history.html) · значение ответа |
| `history.checkin.partial` | частично | [История](screens/history.html) · значение ответа |
| `history.checkin.notStarted` | не начинал(а) | [История](screens/history.html) · значение ответа; «не начинал» / «не начинала» по полу |
| `history.rate.group` | Оценка фразы | [История](screens/history.html) · подпись группы кнопок, не оценено |
| `history.rate.groupDone` | Оценка фразы: уже оценено | [История](screens/history.html) · подпись группы кнопок, оценено |
| `history.rate.q` | Насколько задело? | [История](screens/history.html) · вопрос над кнопками оценки |
| `history.rate.0` | слабо | [История](screens/history.html) · кнопка оценки 0 |
| `history.rate.1` | неприятно | [История](screens/history.html) · кнопка оценки 1 |
| `history.rate.2` | в самое больное | [История](screens/history.html) · кнопка оценки 2 |
| `history.rate.picked` | ✓ {оценка} | [История](screens/history.html) · выбранная оценка у оценённого сообщения |
| `history.rate.done` | Уже оценено | [История](screens/history.html) · подпись у оценённых и при повторной оценке |
| `history.reply` | Ответить | [История](screens/history.html) · кнопка под каждым сообщением, открывает бой с этим сообщением |
| `history.reply.aria` | Ответить на {сообщение} от {время} | [История](screens/history.html) · подпись кнопки для скринридера; сообщение в винительном: «напоминание», «проверку», «упрёк о провале», «упрёк за молчание», «похвалу», «стартовую фразу» |
| `history.more` | Показать ещё | [История](screens/history.html) · кнопка под длинной лентой |
| `history.empty.title` | Дальше будет больше | [История](screens/history.html) · карточка пустого состояния (только фразы старта) |
| `history.empty.body` | Напоминания, проверки и упрёки появятся здесь, когда будет что проверять. Поставь первую задачу, и Батя найдёт, что сказать. | [История](screens/history.html) · карточка пустого состояния |
| `history.empty.cta` | Поставить задачу | [История](screens/history.html) · кнопка пустого состояния |
| `history.again.toast` | Уже оценено: твоя оценка — {оценка}. Изменить её нельзя. | [История](screens/history.html) · уведомление при повторной оценке той же фразы |
| `history.rateErr.title` | Оценка не сохранилась. | [История](screens/history.html) · баннер, жирное начало |
| `history.rateErr.body` | Сеть отвалилась, голос не засчитан. Нажми оценку ещё раз. | [История](screens/history.html) · баннер |
| `history.error.title` | Не загрузилось. | [История](screens/history.html) · баннер ошибки, жирное начало |
| `history.error.body` | Батя всё помнит, а вот история не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». | [История](screens/history.html) · баннер ошибки |
| `history.sample.reminder` | Я тебе говорил, а ты так и не сделал «{task}». Осталось 1 ч 30 мин. | [История](screens/history.html) · образец onReminder |
| `history.sample.checkIn` | Ну что, показывай, что сделано. Или опять «потом»? | [История](screens/history.html) · образец onCheckIn |
| `history.sample.checkIn2` | Что сделано? Вещи сами в машину не сядут. | [История](screens/history.html) · образец onCheckIn |
| `history.sample.fail` | Гараж не убран. Сергей из пятого подъезда свой уже перебрал и перекрасил. | [История](screens/history.html) · образец onFail |
| `history.sample.fail2` | Вторник сам себя не сделает. Завтра новый день, и я опять спрошу. | [История](screens/history.html) · образец onFail |
| `history.sample.missed` | Молчишь. Это ты так английский повторяешь? Тихо и без прогресса. | [История](screens/history.html) · образец onCheckInMissed |
| `history.sample.absent` | Шесть часов тебя нет. Я не волнуюсь. Я просто отмечаю. | [История](screens/history.html) · образец onAbsent |
| `history.sample.success` | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | [История](screens/history.html) · образец onSuccess |
| `history.sample.taskSet` | Записал. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься. | [История](screens/history.html) · образец onTaskSet |
| `history.sample.reminder2` | Осталось 2 часа. Зарядка не для Бати, она для твоей спины. Хотя что я говорю. | [История](screens/history.html) · образец onReminder |
| `history.sample.start1` | Опять ничего сам не можешь? Ну, что тебе надо сделать? | [История](screens/history.html) · стартовая фраза (R-6) |
| `history.sample.start2` | Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко? | [История](screens/history.html) · стартовая фраза (R-6) |
| shop.back | ← Ещё | [Магазин ударов](screens/shop.html) · ссылка назад, все состояния кроме «Из боя» |
| shop.back.battle | ← В бой | [Магазин ударов](screens/shop.html) · ссылка назад, состояния «Из боя» |
| shop.eyebrow | Магазин | [Магазин ударов](screens/shop.html) · над заголовком |
| shop.eyebrow.battle | Магазин · из боя | [Магазин ударов](screens/shop.html) · над заголовком, состояния «Из боя» |
| shop.title | Удары | [Магазин ударов](screens/shop.html) · h1 |
| shop.title.battle | Удары кончились | [Магазин ударов](screens/shop.html) · h1, состояния «Из боя» |
| shop.balance.label | Баланс | [Магазин ударов](screens/shop.html) · карточка баланса |
| shop.balance.label.pending | Баланс пока | [Магазин ударов](screens/shop.html) · карточка баланса, задержка начисления |
| shop.balance.unit | удар / удара / ударов | [Магазин ударов](screens/shop.html) · карточка баланса |
| shop.lead | Один удар — одна твоя реплика Бате в бою. Молчать пока бесплатно. | [Магазин ударов](screens/shop.html) · обычное состояние |
| shop.lead.empty | Один удар — одна твоя реплика Бате в бою. Пока молчишь, он считает, что прав. | [Магазин ударов](screens/shop.html) · пустая история; варианты ниже |
| shop.packs.legend | Пакет ударов | [Магазин ударов](screens/shop.html) · заголовок группы пакетов |
| shop.pack.count | {n} удар / удара / ударов | [Магазин ударов](screens/shop.html) · карточка пакета |
| shop.pack.price | {price} Stars | [Магазин ударов](screens/shop.html) · карточка пакета |
| shop.pack.perStrike | {price} за удар | [Магазин ударов](screens/shop.html) · карточка пакета |
| shop.pack.selected | Выбрано | [Магазин ударов](screens/shop.html) · карточка выбранного пакета |
| shop.pay | Оплатить {price} Stars | [Магазин ударов](screens/shop.html) · главная кнопка |
| shop.pay.retry | Попробовать снова: {price} Stars | [Магазин ударов](screens/shop.html) · главная кнопка, «Оплата не прошла» |
| shop.pay.hint | Оплата Stars откроется прямо здесь, из приложения выходить не нужно. Удары придут в течение минуты. | [Магазин ударов](screens/shop.html) · под кнопкой оплаты |
| shop.pay.hint.short | Оплата Stars откроется прямо здесь, из приложения выходить не нужно. | [Магазин ударов](screens/shop.html) · под кнопкой оплаты, пустая история |
| shop.history.title | История операций | [Магазин ударов](screens/shop.html) · заголовок списка |
| shop.history.more | Показать ещё | [Магазин ударов](screens/shop.html) · кнопка под списком |
| shop.history.empty.title | Пока ни одного удара | [Магазин ударов](screens/shop.html) · пустая история |
| shop.history.empty.body | Купи пакет, и здесь появятся покупки и списания. Других товаров в магазине нет: только удары. | [Магазин ударов](screens/shop.html) · пустая история |
| shop.op.purchase | Покупка: пакет «{name}» | [Магазин ударов](screens/shop.html) · строка истории; name: Один, Три, Пять |
| shop.op.purchase.paid | Оплачено {price} Stars | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.spend | Списание: реплика в бою | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.spend.note | Бой с {role} | [Магазин ударов](screens/shop.html) · строка истории; role: отцом, матерью |
| shop.op.turnRefund | Возврат: ошибка хода | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.turnRefund.note | Причина: судья не ответил, удар вернулся | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.grant | Начисление от владельца | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.reason | Причина: {reason} | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.starsRefund | Возврат Stars | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.starsRefund.note | Причина: возврат за пакет «{name}» по обращению | [Магазин ударов](screens/shop.html) · строка истории |
| shop.op.fresh | только что | [Магазин ударов](screens/shop.html) · пометка новой записи, «Успех» |
| shop.op.amount.unit | удар / удара / ударов | [Магазин ударов](screens/shop.html) · под числом в строке истории |
| shop.help | Что-то не так с платежом? Напиши /paysupport в чате с ботом. Условия продажи: /terms. | [Магазин ударов](screens/shop.html) · внизу, обычное состояние |
| shop.pending.title | Оплата в процессе. | [Магазин ударов](screens/shop.html) · баннер, «Оплата в процессе», жирное начало |
| shop.pending.body | Окно оплаты Telegram открыто. Закончи платёж там, удары начислятся сами. | [Магазин ударов](screens/shop.html) · баннер |
| shop.pending.btn | Ждём оплату… | [Магазин ударов](screens/shop.html) · неактивная кнопка |
| shop.pending.back | Закрыл окно оплаты? Вернуться к выбору | [Магазин ударов](screens/shop.html) · текстовая кнопка |
| shop.success.title | Удары начислены. | [Магазин ударов](screens/shop.html) · карточка «Успех», жирное начало |
| shop.success.body | Было {before}, стало {after}. Батя уже готовится. | [Магазин ударов](screens/shop.html) · карточка «Успех» |
| shop.success.battle | Ответить Бате | [Магазин ударов](screens/shop.html) · главная кнопка «Успех» |
| shop.success.more | Купить ещё | [Магазин ударов](screens/shop.html) · вторичная кнопка «Успех» |
| shop.failed.title | Оплата не прошла. | [Магазин ударов](screens/shop.html) · баннер, жирное начало |
| shop.failed.body | Удары не начислены, баланс прежний. Можно попробовать ещё раз. | [Магазин ударов](screens/shop.html) · баннер |
| shop.failed.help | Если Telegram всё же списал Stars, а удары не пришли в течение минуты, напиши /paysupport в чате с ботом. | [Магазин ударов](screens/shop.html) · под кнопкой |
| shop.delay.title | Платёж принят, удары в пути. | [Магазин ударов](screens/shop.html) · баннер, жирное начало |
| shop.delay.body | Начислим в течение минуты. Второй раз платить не нужно: мы не потеряем ни одного удара и не начислим лишнего. | [Магазин ударов](screens/shop.html) · баннер |
| shop.delay.refresh | Обновить баланс | [Магазин ударов](screens/shop.html) · главная кнопка |
| shop.delay.hint | Пакеты временно скрыты, чтобы не заплатить дважды. Через минуту баланс обновится сам. | [Магазин ударов](screens/shop.html) · под кнопкой |
| shop.delay.help | Не пришло и через 5 минут? Напиши /paysupport в чате с ботом, мы разберёмся. | [Магазин ударов](screens/shop.html) · внизу |
| shop.battle.ctx | Твоя реплика ждёт в поле боя | [Магазин ударов](screens/shop.html) · карточка контекста, «Из боя» |
| shop.battle.ctx.done | Твоя реплика в поле боя | [Магазин ударов](screens/shop.html) · карточка контекста, «Из боя: оплачено» |
| shop.battle.reply | «{text}» | [Магазин ударов](screens/shop.html) · сохранённая реплика, пример: «А сам-то в моём возрасте чем занимался?» |
| shop.battle.hint | После оплаты вернёшься в бой: диалог и набранный текст никуда не денутся. | [Магазин ударов](screens/shop.html) · под кнопкой оплаты, «Из боя» |
| shop.battle.ok.title | Оплачено. | [Магазин ударов](screens/shop.html) · карточка, «Из боя: оплачено», жирное начало |
| shop.battle.ok.body | На балансе {n} удар. Твоя реплика на месте, можно отправлять. | [Магазин ударов](screens/shop.html) · карточка |
| shop.battle.return | Вернуться в бой | [Магазин ударов](screens/shop.html) · главная кнопка, «Из боя: оплачено» |
| shop.error.title | Магазин не открылся. | [Магазин ударов](screens/shop.html) · баннер ошибки, жирное начало |
| shop.error.body | Ничего не списано. Проверь интернет и нажми «Повторить». | [Магазин ударов](screens/shop.html) · баннер ошибки |
| settings.back | ← Ещё | [Настройки](screens/settings.html) · ссылка назад |
| settings.eyebrow | Дневник · ты | [Настройки](screens/settings.html) · над заголовком |
| settings.title | Настройки | [Настройки](screens/settings.html) · h1 |
| settings.role.legend | Родитель | [Настройки](screens/settings.html) · группа переключателя |
| settings.role.father | Отец | [Настройки](screens/settings.html) · переключатель |
| settings.role.mother | Мать | [Настройки](screens/settings.html) · переключатель |
| settings.role.hint | Задачи и уважение останутся. Бой с каждым родителем свой: побеждённость не переносится. | [Настройки](screens/settings.html) · подсказка под полем |
| settings.gender.legend | Твой пол | [Настройки](screens/settings.html) · группа переключателя |
| settings.gender.male | Мужской | [Настройки](screens/settings.html) · переключатель |
| settings.gender.female | Женский | [Настройки](screens/settings.html) · переключатель |
| settings.gender.hint | Новые фразы будут с другими окончаниями. Старые в «Истории» не меняются. | [Настройки](screens/settings.html) · подсказка под полем |
| settings.tz.label | Часовой пояс | [Настройки](screens/settings.html) · подпись поля |
| settings.tz.hint | Сроки задач покажутся в новом поясе, но сам момент срока не сдвинется. | [Настройки](screens/settings.html) · подсказка под полем |
| settings.tz.option | {город}, UTC{смещение} | [Настройки](screens/settings.html) · пункт списка; в макете 10 поясов от Калининграда (UTC+2) до Владивостока (UTC+10) |
| settings.quiet.legend | Тихие часы | [Настройки](screens/settings.html) · группа полей |
| settings.quiet.from | С | [Настройки](screens/settings.html) · подпись поля времени |
| settings.quiet.to | До | [Настройки](screens/settings.html) · подпись поля времени |
| settings.quiet.hint | Бот молчит {hours} ч: с {from} до {to}. Шаг 30 минут. Если «с» и «до» совпадают, тихих часов нет. | [Настройки](screens/settings.html) · подсказка под полями |
| settings.quiet.off | Без тихих часов | [Настройки](screens/settings.html) · текстовая кнопка |
| settings.quiet.off.title | Тихих часов нет (0 ч). | [Настройки](screens/settings.html) · подсказка, состояние «Без тихих часов», жирное начало |
| settings.quiet.off.body | Бот может написать в любое время, даже ночью. Утром после провала считаем 08:00. | [Настройки](screens/settings.html) · подсказка, состояние «Без тихих часов» |
| settings.quiet.restore | Вернуть 23:00–08:00 | [Настройки](screens/settings.html) · текстовая кнопка, состояние «Без тихих часов» |
| settings.rating.label | Участвую в общем рейтинге | [Настройки](screens/settings.html) · флажок |
| settings.rating.hint | Другие видят только твой username и число закрытых задач. Сейчас ты в рейтинге. | [Настройки](screens/settings.html) · подсказка к флажку |
| settings.rating.hint.out | Другие видят только твой username и число закрытых задач. Сейчас ты не участвуешь. | [Настройки](screens/settings.html) · подсказка к флажку, если вышел |
| settings.save | Сохранить | [Настройки](screens/settings.html) · главная кнопка |
| settings.saved | Сохранено. Батя принял к сведению. | [Настройки](screens/settings.html) · уведомление, состояние «Сохранено» |
| settings.saveError.title | Не сохранилось. | [Настройки](screens/settings.html) · баннер, жирное начало |
| settings.saveError.body | Сеть подвела, прежние настройки остались. Проверь интернет и нажми «Сохранить» ещё раз. | [Настройки](screens/settings.html) · баннер ошибки сохранения |
| settings.danger.title | Опасная зона | [Настройки](screens/settings.html) · заголовок блока |
| settings.danger.body | Удаление стирает профиль, задачи, ленту, бои и место в рейтинге. Вернуть это нельзя. | [Настройки](screens/settings.html) · блок удаления |
| settings.delete | Удалить аккаунт | [Настройки](screens/settings.html) · кнопка в опасной зоне |
| settings.del.step1 | Шаг 1 из 2 | [Настройки](screens/settings.html) · шторка, первое подтверждение |
| settings.del.step2 | Шаг 2 из 2 | [Настройки](screens/settings.html) · шторка, второе подтверждение |
| settings.del.bg | Родитель, пол, пояс, тихие часы, рейтинг: всё останется как было, пока ты не подтвердишь. | [Настройки](screens/settings.html) · карточка за шторкой |
| settings.del1.title | Удалить аккаунт? | [Настройки](screens/settings.html) · шторка, шаг 1 |
| settings.del1.body | Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Батя даже не попрощается. | [Настройки](screens/settings.html) · шторка, шаг 1 |
| settings.del1.keep | Оставить аккаунт | [Настройки](screens/settings.html) · безопасная кнопка, шаг 1 |
| settings.del1.next | Продолжить удаление | [Настройки](screens/settings.html) · опасная кнопка, шаг 1 |
| settings.del2.title | Это насовсем | [Настройки](screens/settings.html) · шторка, шаг 2 |
| settings.del2.burn | {n} удар сгорит / удара сгорят / ударов сгорят | [Настройки](screens/settings.html) · красная строка, шаг 2, только если ударов больше 0; пример «4 удара сгорят» |
| settings.del2.body | Неизрасходованные удары пропадут, Stars за них не вернутся. Задачи, бои и место в рейтинге исчезнут. Записи о платежах останутся. | [Настройки](screens/settings.html) · шаг 2 с ударами |
| settings.del2.body.zero | Профиль, задачи, бои и место в рейтинге исчезнут. Вернуть их нельзя. | [Настройки](screens/settings.html) · шаг 2 без ударов |
| settings.del2.keep | Не удалять | [Настройки](screens/settings.html) · безопасная кнопка, шаг 2 |
| settings.del2.confirm | Удалить окончательно | [Настройки](screens/settings.html) · опасная кнопка, шаг 2 |
| settings.deleted.eyebrow | Дневник закрыт | [Настройки](screens/settings.html) · состояние «Аккаунт удалён» |
| settings.deleted.stamp | Аккаунт удалён | [Настройки](screens/settings.html) · штамп |
| settings.deleted.quote | Задачи стёрты, лента пуста, бот больше не напишет. Хотя Батя, конечно, не такой, чтобы навязываться. | [Настройки](screens/settings.html) · реплика Бати |
| settings.deleted.who | Батя | [Настройки](screens/settings.html) · подпись под репликой |
| settings.deleted.again | Если захочешь вернуться, отправь боту /start. Начнёшь с нуля. | [Настройки](screens/settings.html) · под репликой |
| rating.eyebrow | Рейтинг · за всё время | [Рейтинг](screens/leaderboard.html) · над заголовком |
| rating.title | Кто сколько закрыл | [Рейтинг](screens/leaderboard.html) · h1 |
| rating.lead | Считаются закрытые задачи, а не добрые намерения. Размер не важен: микрозадача идёт за одну, как и большая. | [Рейтинг](screens/leaderboard.html) · под заголовком |
| rating.mine.cap | Так тебя видят другие | [Рейтинг](screens/leaderboard.html) · карточка своей строки, если участвуешь |
| rating.mine.cap.out | Твоя карточка | [Рейтинг](screens/leaderboard.html) · карточка своей строки, если вышел |
| rating.me.tag | Вы | [Рейтинг](screens/leaderboard.html) · метка своей строки |
| rating.count | {n} задача / задачи / задач | [Рейтинг](screens/leaderboard.html) · в строке участника |
| rating.mine.place | Ты на {place} месте. Другим видны только username и число закрытых задач. | [Рейтинг](screens/leaderboard.html) · карточка, участник в сотне |
| rating.mine.outside | В сотню лучших ты пока не попал. Свою строку другие видят в общем списке. | [Рейтинг](screens/leaderboard.html) · карточка, участник вне сотни |
| rating.mine.zero | В таблице тебя нет: туда попадают с первой закрытой задачи. Закрой хотя бы микрозадачу. | [Рейтинг](screens/leaderboard.html) · карточка, нет закрытых задач |
| rating.leave | Выйти из рейтинга | [Рейтинг](screens/leaderboard.html) · вторичная кнопка в карточке |
| rating.out.tag | Вы не участвуете | [Рейтинг](screens/leaderboard.html) · метка в карточке, если вышел |
| rating.out.note | Другие тебя не видят. Твои {n} закрытых задач никуда не делись, при возвращении они учтутся. | [Рейтинг](screens/leaderboard.html) · карточка, состояние «Вышел из рейтинга» |
| rating.rejoin | Участвовать снова | [Рейтинг](screens/leaderboard.html) · главная кнопка, если вышел |
| rating.list.aria | Первые 100 участников по числу закрытых задач | [Рейтинг](screens/leaderboard.html) · подпись таблицы для скринридера |
| rating.gap | · · · ещё {n} строк · · · | [Рейтинг](screens/leaderboard.html) · пропуск строк в макете |
| rating.gap.toHundred | · · · до сотни ещё {n} строк · · · | [Рейтинг](screens/leaderboard.html) · пропуск строк в макете |
| rating.under | Вы: {place} место, {n} задач | [Рейтинг](screens/leaderboard.html) · строка под таблицей, участник вне сотни или без закрытых задач; пример «Вы: 340 место, 12 задач» |
| rating.tie | При равенстве выше тот, кто закрыл последнюю задачу раньше. Если нет username, показываем имя из Telegram. | [Рейтинг](screens/leaderboard.html) · подпись под таблицей |
| rating.tie.short | При равенстве выше тот, кто закрыл последнюю задачу раньше. Поэтому у двоих по 40 задач, а места разные. | [Рейтинг](screens/leaderboard.html) · подпись, состояние «Вне сотни» |
| rating.new | Поставить задачу | [Рейтинг](screens/leaderboard.html) · главная кнопка, «Без закрытых задач» и «Пусто» |
| rating.empty.title | Пока никого. Будь первым | [Рейтинг](screens/leaderboard.html) · карточка, «Пусто» |
| rating.empty.body | Закрытых задач ни у кого нет, таблица пуста. Закрой первую, и твоё имя будет вверху. | [Рейтинг](screens/leaderboard.html) · карточка, «Пусто» |
| rating.emptyLeft.body | В таблице пусто: все, включая тебя, из рейтинга вышли. | [Рейтинг](screens/leaderboard.html) · карточка, «Пусто, я вышел» |
| rating.error.title | Не загрузилось. | [Рейтинг](screens/leaderboard.html) · баннер, жирное начало |
| rating.error.body | Таблица не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». | [Рейтинг](screens/leaderboard.html) · баннер |
| owner.back | ← Ещё | [Раздел владельца](screens/owner.html) · ссылка назад |
| owner.eyebrow | Раздел владельца | [Раздел владельца](screens/owner.html) · над заголовком |
| owner.tag | только владелец | [Раздел владельца](screens/owner.html) · метка рядом с eyebrow |
| owner.title | Кабинет | [Раздел владельца](screens/owner.html) · h1 |
| owner.tabs.aria | Разделы владельца | [Раздел владельца](screens/owner.html) · подпись вкладок |
| owner.tab.phrases | Фразы | [Раздел владельца](screens/owner.html) · вкладка |
| owner.tab.roles | Роли и цены | [Раздел владельца](screens/owner.html) · вкладка |
| owner.tab.strikes | Удары | [Раздел владельца](screens/owner.html) · вкладка |
| owner.tab.metrics | Метрики | [Раздел владельца](screens/owner.html) · вкладка |
| owner.tab.log | Журнал | [Раздел владельца](screens/owner.html) · вкладка |
| owner.denied.stamp | Нет доступа | [Раздел владельца](screens/owner.html) · штамп, отказ доступа |
| owner.denied.title | Эта страница только для владельца | [Раздел владельца](screens/owner.html) · отказ доступа |
| owner.denied.body | Батя здесь один, и это не ты. Ничего не изменилось, твои данные на месте. | [Раздел владельца](screens/owner.html) · отказ доступа |
| owner.denied.back | Вернуться в «Ещё» | [Раздел владельца](screens/owner.html) · кнопка, отказ доступа |
| owner.error.title | Не загрузилось. | [Раздел владельца](screens/owner.html) · баннер ошибки, жирное начало |
| owner.error.body | Данные раздела не пришли, ничего не изменилось. Проверь интернет и нажми «Повторить». | [Раздел владельца](screens/owner.html) · баннер ошибки |
| owner.phrases.add.title | Добавить фразу | [Раздел владельца](screens/owner.html) · заголовок формы |
| owner.phrases.role | Роль | [Раздел владельца](screens/owner.html) · поле; значения: Отец, Мать, Любая |
| owner.phrases.category | Категория | [Раздел владельца](screens/owner.html) · поле; значения: категории пула |
| owner.phrases.level | Уровень | [Раздел владельца](screens/owner.html) · поле; значения: Без уровня, 1, 2, 3 |
| owner.phrases.defeat | Уровень побеждённости | [Раздел владельца](screens/owner.html) · поле; значения: Любой, 1, 2, 3, 4 |
| owner.phrases.combo | Сочетание роли и пола | [Раздел владельца](screens/owner.html) · поле; значения: Любое, Отец × сын, Отец × дочь, Мать × сын, Мать × дочь |
| owner.phrases.source | Источник | [Раздел владельца](screens/owner.html) · поле; значения: Владелец, Подписчик |
| owner.phrases.author | Автор | [Раздел владельца](screens/owner.html) · поле |
| owner.phrases.author.hint | Видите только вы. | [Раздел владельца](screens/owner.html) · подсказка к автору |
| owner.phrases.text | Текст фразы | [Раздел владельца](screens/owner.html) · поле |
| owner.phrases.text.hint | Слова по роду пишите с окончанием в скобках: сделал(а). Переменные: {task}, {time}, {left}, {name}, {other}. | [Раздел владельца](screens/owner.html) · подсказка к тексту |
| owner.phrases.add | Добавить фразу | [Раздел владельца](screens/owner.html) · главная кнопка формы |
| owner.phrases.addAndParaphrase | Добавить и запросить перефразы | [Раздел владельца](screens/owner.html) · вторичная кнопка формы |
| owner.para.title | Перефразы на одобрение | [Раздел владельца](screens/owner.html) · заголовок списка |
| owner.para.was | Была: {text} | [Раздел владельца](screens/owner.html) · исходная фраза в карточке перефраза |
| owner.para.tag | перефраз | [Раздел владельца](screens/owner.html) · метка карточки |
| owner.para.approve | Одобрить | [Раздел владельца](screens/owner.html) · кнопка |
| owner.para.reject | Отклонить | [Раздел владельца](screens/owner.html) · кнопка |
| owner.para.note | Отклонённый перефраз пользователям не показывается. Одобренный становится отдельной фразой. | [Раздел владельца](screens/owner.html) · подпись под списком |
| owner.off.title | Выключенные и ниже порога | [Раздел владельца](screens/owner.html) · заголовок списка |
| owner.off.cell | {роль} · {категория} · уровень {n} · {побеждённость} · {сочетание} | [Раздел владельца](screens/owner.html) · метки ячейки у фразы |
| owner.off.stats | avg {avg} · {votes} голос / голоса / голосов · источник: {source} / автор {author} | [Раздел владельца](screens/owner.html) · статистика фразы |
| owner.off.autoOff | Выключена: avg ниже 0,4 | [Раздел владельца](screens/owner.html) · метка фразы, выключенной автоматически |
| owner.off.manualOff | Выключена вручную | [Раздел владельца](screens/owner.html) · метка фразы |
| owner.off.below | Ниже порога, включена | [Раздел владельца](screens/owner.html) · метка фразы |
| owner.off.last | Последняя включённая в своей ячейке: выключить нельзя. | [Раздел владельца](screens/owner.html) · подпись у фразы |
| owner.off.enable | Включить | [Раздел владельца](screens/owner.html) · кнопка |
| owner.off.disable | Выключить | [Раздел владельца](screens/owner.html) · кнопка |
| owner.refuse.title | В ячейке не останется фраз. | [Раздел владельца](screens/owner.html) · баннер отказа, жирное начало |
| owner.refuse.body | Эта фраза последняя включённая в ячейке «{ячейка}». Сначала добавьте другую, потом выключайте. | [Раздел владельца](screens/owner.html) · баннер отказа |
| owner.refuse.add | Добавить фразу в эту ячейку | [Раздел владельца](screens/owner.html) · кнопка под отказом |
| owner.empty.para.title | Перефразов на одобрение нет | [Раздел владельца](screens/owner.html) · пустой список |
| owner.empty.para.body | Они появятся, когда вы запросите перефразы у добавленной фразы. | [Раздел владельца](screens/owner.html) · пустой список |
| owner.empty.off.title | Выключенных фраз нет | [Раздел владельца](screens/owner.html) · пустой список |
| owner.empty.off.body | Все фразы в деле, ни одна не ниже порога. | [Раздел владельца](screens/owner.html) · пустой список |
| owner.roles.title | Карточки ролей | [Раздел владельца](screens/owner.html) · заголовок раздела |
| owner.roles.note | Изменение действует на новые ходы боя. Больных мест не меньше 5. | [Раздел владельца](screens/owner.html) · подпись |
| owner.roles.summary | {роль} · {n} больных мест | [Раздел владельца](screens/owner.html) · заголовок раскрывающейся карточки |
| owner.roles.char | Характер | [Раздел владельца](screens/owner.html) · поле |
| owner.roles.weak.remove | Убрать | [Раздел владельца](screens/owner.html) · кнопка у больного места, неактивна при пяти |
| owner.roles.weak.removeAria | Убрать больное место «{название}»: нельзя, их должно быть не меньше пяти | [Раздел владельца](screens/owner.html) · подпись кнопки для скринридера |
| owner.roles.weak.min | Убрать больное место нельзя, пока их пять. Сначала добавьте новое. | [Раздел владельца](screens/owner.html) · подсказка |
| owner.roles.weak.add | Добавить больное место | [Раздел владельца](screens/owner.html) · кнопка |
| owner.roles.save | Сохранить карточку «{роль}» | [Раздел владельца](screens/owner.html) · кнопка |
| owner.prices.title | Пакеты ударов | [Раздел владельца](screens/owner.html) · заголовок раздела |
| owner.prices.pack | Первый / Второй / Третий пакет | [Раздел владельца](screens/owner.html) · заголовок строки пакета |
| owner.prices.strikes | Ударов | [Раздел владельца](screens/owner.html) · поле |
| owner.prices.price | Цена, Stars | [Раздел владельца](screens/owner.html) · поле |
| owner.prices.active | Продаётся | [Раздел владельца](screens/owner.html) · флажок |
| owner.prices.save | Сохранить цены | [Раздел владельца](screens/owner.html) · главная кнопка |
| owner.prices.note | Пользователи увидят новые цены при следующем открытии магазина. Уже выставленные счета останутся по старой цене. | [Раздел владельца](screens/owner.html) · подпись |
| owner.strikes.id | Telegram ID пользователя | [Раздел владельца](screens/owner.html) · поле поиска |
| owner.strikes.id.hint | Введите ID, чтобы увидеть баланс и историю операций. | [Раздел владельца](screens/owner.html) · подсказка, пустое состояние |
| owner.strikes.find | Найти | [Раздел владельца](screens/owner.html) · кнопка |
| owner.strikes.balance | Баланс | [Раздел владельца](screens/owner.html) · карточка пользователя |
| owner.strikes.unit | ударов | [Раздел владельца](screens/owner.html) · карточка пользователя |
| owner.strikes.privacy | Задачи и диалоги вы не видите, только платежи и удары. | [Раздел владельца](screens/owner.html) · карточка пользователя |
| owner.op.title | Начислить или списать | [Раздел владельца](screens/owner.html) · заголовок формы |
| owner.op.legend | Операция | [Раздел владельца](screens/owner.html) · группа переключателя |
| owner.op.grant | Начислить | [Раздел владельца](screens/owner.html) · переключатель |
| owner.op.revoke | Списать | [Раздел владельца](screens/owner.html) · переключатель |
| owner.op.count | Сколько ударов | [Раздел владельца](screens/owner.html) · поле |
| owner.op.reason | Причина (обязательно) | [Раздел владельца](screens/owner.html) · поле |
| owner.op.reason.hint | Попадёт в историю пользователя и в ваш журнал. | [Раздел владельца](screens/owner.html) · подсказка |
| owner.op.reason.err.title | Укажите причину. | [Раздел владельца](screens/owner.html) · ошибка поля, жирное начало |
| owner.op.reason.err.body | Баланс не изменился: операция без причины не выполняется. | [Раздел владельца](screens/owner.html) · ошибка поля |
| owner.op.submit | Начислить {n} удара / Списать {n} удара | [Раздел владельца](screens/owner.html) · главная кнопка формы |
| owner.hist.title | История операций | [Раздел владельца](screens/owner.html) · заголовок таблицы |
| owner.hist.col.date | Дата | [Раздел владельца](screens/owner.html) · колонка |
| owner.hist.col.op | Операция | [Раздел владельца](screens/owner.html) · колонка |
| owner.hist.col.n | Удары | [Раздел владельца](screens/owner.html) · колонка |
| owner.hist.col.reason | Причина | [Раздел владельца](screens/owner.html) · колонка |
| owner.hist.col.act | Действие | [Раздел владельца](screens/owner.html) · колонка |
| owner.hist.purchase | Покупка: пакет «{name}» | [Раздел владельца](screens/owner.html) · строка таблицы |
| owner.hist.spend | Списание: реплика в бою | [Раздел владельца](screens/owner.html) · строка таблицы |
| owner.hist.spendReason | ход в бою с {родителем} | [Раздел владельца](screens/owner.html) · причина в строке таблицы |
| owner.hist.refundStars | Вернуть Stars | [Раздел владельца](screens/owner.html) · кнопка у покупки без израсходованных ударов |
| owner.hist.refundNo | Возврат Stars недоступен: израсходован {n} удар / удара / ударов | [Раздел владельца](screens/owner.html) · пометка у покупки с израсходованными ударами |
| owner.tickets.title | Обращения /paysupport | [Раздел владельца](screens/owner.html) · заголовок списка |
| owner.tickets.open | {n} открыто | [Раздел владельца](screens/owner.html) · счётчик |
| owner.tickets.status.open | Открыто | [Раздел владельца](screens/owner.html) · метка обращения |
| owner.tickets.openUser | Открыть пользователя | [Раздел владельца](screens/owner.html) · кнопка |
| owner.tickets.resolve | Отметить решённым | [Раздел владельца](screens/owner.html) · кнопка |
| owner.tickets.empty.title | Обращений нет | [Раздел владельца](screens/owner.html) · пустой список |
| owner.tickets.empty.body | Когда пользователь напишет /paysupport, обращение появится здесь вместе с его Telegram ID. | [Раздел владельца](screens/owner.html) · пустой список |
| owner.refund.step | Нужно подтверждение | [Раздел владельца](screens/owner.html) · шторка возврата Stars |
| owner.refund.title | Вернуть {price} Stars за пакет «{name}»? | [Раздел владельца](screens/owner.html) · шторка |
| owner.refund.body | Удары пакета спишутся: баланс станет {after} вместо {before}. Из пакета не израсходовано ни одного удара. Отменить возврат нельзя, запись попадёт в историю пользователя и в журнал. | [Раздел владельца](screens/owner.html) · шторка |
| owner.refund.reason | Причина (обязательно) | [Раздел владельца](screens/owner.html) · поле в шторке |
| owner.refund.cancel | Отмена | [Раздел владельца](screens/owner.html) · безопасная кнопка |
| owner.refund.confirm | Вернуть {price} Stars | [Раздел владельца](screens/owner.html) · опасная кнопка |
| owner.metrics.period | Период | [Раздел владельца](screens/owner.html) · группа переключателя |
| owner.metrics.7 | 7 дней | [Раздел владельца](screens/owner.html) · переключатель |
| owner.metrics.30 | 30 дней | [Раздел владельца](screens/owner.html) · переключатель |
| owner.metrics.custom | Свой | [Раздел владельца](screens/owner.html) · переключатель |
| owner.metrics.from | С | [Раздел владельца](screens/owner.html) · поле даты |
| owner.metrics.to | По | [Раздел владельца](screens/owner.html) · поле даты |
| owner.metrics.col.name | Метрика | [Раздел владельца](screens/owner.html) · колонка |
| owner.metrics.col.value | Значение | [Раздел владельца](screens/owner.html) · колонка |
| owner.metrics.retention7 | Возврат на 7-й день | [Раздел владельца](screens/owner.html) · строка; пояснение «живёт ли продукт после первой шутки» |
| owner.metrics.closedShare | Доля закрытых задач и периодов | [Раздел владельца](screens/owner.html) · строка; пояснение «работает ли давление» |
| owner.metrics.checkInShare | Доля отвеченных проверок | [Раздел владельца](screens/owner.html) · строка; пояснение «эффективность проверок» |
| owner.metrics.firstPurchase | Конверсия в первую покупку | [Раздел владельца](screens/owner.html) · строка; пояснение «работает ли триггер «Ответить»» |
| owner.metrics.turnCost | Стоимость хода в токенах к выручке с удара | [Раздел владельца](screens/owner.html) · строка; пояснение «экономика боя» |
| owner.metrics.blocked | Заблокировали бота | [Раздел владельца](screens/owner.html) · строка; пояснение «не перегибает ли давление» |
| owner.metrics.phraseScore | Средний балл фраз | [Раздел владельца](screens/owner.html) · строка; пояснение «качество контента» |
| owner.metrics.shares | Пересылок карточки на 100 активных | [Раздел владельца](screens/owner.html) · строка; пояснение «работает ли шеринг» |
| owner.metrics.firstTask | Медиана от /start до первой задачи | [Раздел владельца](screens/owner.html) · строка; пояснение «понятен ли старт» |
| owner.metrics.note | Пороги пока не заданы, поэтому значения не оцениваются цветом. Числа в макете примерные. | [Раздел владельца](screens/owner.html) · подпись под таблицей |
| owner.log.filter | Действие | [Раздел владельца](screens/owner.html) · поле фильтра |
| owner.log.all | Все действия | [Раздел владельца](screens/owner.html) · значение фильтра |
| owner.log.col.at | Когда | [Раздел владельца](screens/owner.html) · колонка |
| owner.log.col.action | Действие | [Раздел владельца](screens/owner.html) · колонка |
| owner.log.col.target | Над чем | [Раздел владельца](screens/owner.html) · колонка |
| owner.log.col.details | Подробности | [Раздел владельца](screens/owner.html) · колонка |
| owner.log.action | Фраза добавлена / Фраза включена или выключена / Перефраз проверен / Карточка роли изменена / Цена пакета изменена / Удары начислены / Удары списаны / Stars возвращены | [Раздел владельца](screens/owner.html) · названия действий журнала и значения фильтра |
| owner.log.note | Записи только добавляются, исправить или удалить их нельзя. | [Раздел владельца](screens/owner.html) · подпись под таблицей |
| more.eyebrow | Дневник · прочее | [Ещё](screens/more.html) · заголовок всех состояний |
| more.title | Ещё | [Ещё](screens/more.html) · h1 |
| more.who | {username} · родитель: {role} | [Ещё](screens/more.html) · под заголовком; role: отец, мать |
| more.group.mine | Твоё | [Ещё](screens/more.html) · заголовок группы |
| more.shop.title | Магазин ударов | [Ещё](screens/more.html) · пункт меню, ведёт в магазин |
| more.shop.sub | Чтобы ответить Бате, нужны удары | [Ещё](screens/more.html) · пункт меню, баланс больше 0 |
| more.shop.sub.zero | Ударов нет, отвечать Бате нечем | [Ещё](screens/more.html) · пункт меню, баланс 0 |
| more.shop.balance | {n} удар / удара / ударов | [Ещё](screens/more.html) · справа в пункте «Магазин ударов» |
| more.settings.title | Настройки | [Ещё](screens/more.html) · пункт меню |
| more.settings.sub | Родитель, пол, пояс, тихие часы, рейтинг | [Ещё](screens/more.html) · пункт меню |
| more.group.owner | Для владельца | [Ещё](screens/more.html) · заголовок группы, только у владельца |
| more.owner.title | Раздел владельца | [Ещё](screens/more.html) · пункт меню, только у владельца |
| more.owner.sub | Фразы, цены, удары пользователей, метрики, журнал | [Ещё](screens/more.html) · пункт меню, только у владельца |
| more.owner.tag | только владелец | [Ещё](screens/more.html) · метка пункта |
| more.group.legal | Условия и платежи | [Ещё](screens/more.html) · заголовок группы |
| more.terms.title | Условия продажи | [Ещё](screens/more.html) · пункт меню, отправляет /terms |
| more.terms.sub | Команда /terms, откроется чат с ботом | [Ещё](screens/more.html) · пункт меню |
| more.paysupport.title | Вопрос по платежу | [Ещё](screens/more.html) · пункт меню, отправляет /paysupport |
| more.paysupport.sub | Команда /paysupport, откроется чат с ботом | [Ещё](screens/more.html) · пункт меню |
| more.legal.note | Команда уйдёт в чат с ботом. Для вопроса по платежу после команды опиши, что случилось, одним сообщением. | [Ещё](screens/more.html) · подпись под группой |
| more.error.title | Не загрузилось. | [Ещё](screens/more.html) · состояние «Ошибка», жирное начало баннера |
| more.error.body | Баланс ударов не показался: сеть отвалилась. Проверь интернет и нажми «Повторить». | [Ещё](screens/more.html) · состояние «Ошибка», баннер |
| nav.home | Главная | Все экраны с нижним меню |
| nav.battle | Бой | Все экраны с нижним меню |
| nav.history | История | Все экраны с нижним меню |
| nav.rating | Рейтинг | Все экраны с нижним меню |
| nav.more | Ещё | Все экраны с нижним меню |
| nav.aria | Основное меню | [Ещё](screens/more.html) · подпись нижнего меню для скринридера |
| `share.eyebrow` | Поделиться | [Карточка для шеринга](screens/share-card.html) · над заголовком |
| `share.title` | Карточка | [Карточка для шеринга](screens/share-card.html) · h1 |
| `share.caption` | Так карточка выглядит в чате | [Карточка для шеринга](screens/share-card.html) · подпись под предпросмотром |
| `share.note.done` | На карточке нет твоего имени, username и названия задачи. Только фраза Бати и ссылка на бота. | [Карточка для шеринга](screens/share-card.html) · подпись, «Готово» |
| `share.note.fail` | Название задачи на карточку не попадает: вместо него слово «задачу». | [Карточка для шеринга](screens/share-card.html) · подпись, «Провал» |
| `share.note.battle` | До слома на карточку идёт стартовая фраза родителя и текущая степень победы. | [Карточка для шеринга](screens/share-card.html) · подпись, «Бой» без слома |
| `share.note.break` | Ответы нейросети на карточку не попадают: только финальная фраза Бати из заготовленных. | [Карточка для шеринга](screens/share-card.html) · подпись, «Бой» со сломом |
| `share.note.gender` | Вместо имени стоит «дочка» или «сынок» по твоему полу. | [Карточка для шеринга](screens/share-card.html) · подпись, карточка матери |
| `share.send` | Отправить в чат | [Карточка для шеринга](screens/share-card.html) · главная кнопка, открывает выбор чата Telegram |
| `share.back` | Назад | [Карточка для шеринга](screens/share-card.html) · текстовая кнопка |
| `share.cancel` | Отмена | [Карточка для шеринга](screens/share-card.html) · текстовая кнопка, «Создаётся» и «Ошибка» |
| `share.creating` | Батя берёт ручку… | [Карточка для шеринга](screens/share-card.html) · статус, пока карточка создаётся |
| `share.error.title` | Не получилось, ещё раз? | [Карточка для шеринга](screens/share-card.html) · баннер ошибки, жирное начало (R-120) |
| `share.error.body` | Карточка не создалась, ничего не отправлено. | [Карточка для шеринга](screens/share-card.html) · баннер ошибки |
| `share.sent` | Карточка ушла в чат. Теперь все узнают, как тебя воспитывали. | [Карточка для шеринга](screens/share-card.html) · уведомление после отправки |
| `share.sent.home` | На главную | [Карточка для шеринга](screens/share-card.html) · главная кнопка после отправки |
| `share.sent.again` | Отправить ещё раз | [Карточка для шеринга](screens/share-card.html) · вторая кнопка после отправки |
| `share.card.parent` | Родитель | [Карточка для шеринга](screens/share-card.html) · подпись роли на карточке |
| `share.card.role.father` | Отец | [Карточка для шеринга](screens/share-card.html) · значение роли на карточке |
| `share.card.role.mother` | Мать | [Карточка для шеринга](screens/share-card.html) · значение роли на карточке |
| `share.card.sign.father` | — Батя | [Карточка для шеринга](screens/share-card.html) · подпись внизу карточки |
| `share.card.sign.mother` | — Мама | [Карточка для шеринга](screens/share-card.html) · подпись внизу карточки |
| `share.card.stamp.fail` | Задача провалена | [Карточка для шеринга](screens/share-card.html) · штамп на карточке провала, регистр верхний через CSS |
| `share.card.stamp.break` | Сломлен | [Карточка для шеринга](screens/share-card.html) · штамп на карточке слома, регистр верхний через CSS |
| `share.card.degree` | степень победы | [Карточка для шеринга](screens/share-card.html) · подпись под числом на карточке боя |
| `share.card.level` | уровень {n} из 4 | [Карточка для шеринга](screens/share-card.html) · уровень степени победы: 1 от 0, 2 от 20, 3 от 50, 4 от 80 |
| `share.card.url` | t.me/{бот} | [Карточка для шеринга](screens/share-card.html) · ссылка на бота без реферальной метки; username бота подставляется из настройки |
| `share.card.alt.done` | Карточка для чата. Дневник, родитель: {роль}, отметка «Выполнено». Фраза: {фраза}. Подпись: {подпись}. | [Карточка для шеринга](screens/share-card.html) · описание изображения для скринридера, «Готово» |
| `share.card.alt.fail` | Карточка для чата. Дневник, родитель: {роль}, оценка 2, штамп «Задача провалена». Фраза: {фраза}. Подпись: {подпись}. | [Карточка для шеринга](screens/share-card.html) · описание изображения, «Провал» |
| `share.card.alt.battle` | Карточка для чата. Дневник, родитель: {роль}, степень победы {n}, уровень {уровень} из 4. Фраза: {фраза}. Подпись: {подпись}. | [Карточка для шеринга](screens/share-card.html) · описание изображения, «Бой» |
| `share.card.alt.break` | Карточка для чата. Дневник, родитель: {роль}, степень победы 100, уровень 4 из 4, штамп «Сломлен». Фраза: {фраза}. Подпись: {подпись}. | [Карточка для шеринга](screens/share-card.html) · описание изображения, слом |
| `share.phrase.done` | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | [Карточка для шеринга](screens/share-card.html#done) · из done#medium; другие образцы — shareSamples в viewer.js |
| `share.phrase.fail` | Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенный. | [Карточка для шеринга](screens/share-card.html#fail) · из fail#normal, название обезличено; другие образцы — shareSamples в viewer.js |
| `share.phrase.failMother` | Дочка, ты опять провалила задачу. Я для тебя всё, а ты даже это не можешь. | [Карточка для шеринга](screens/share-card.html) · фраза onFail матери на карточке, образец |
| `share.phrase.battleStart` | Ну что, пришёл разговаривать? Я слушаю. Недолго. | [Карточка для шеринга](screens/share-card.html) · фраза onBattleStart на карточке боя, образец |
| `share.phrase.break` | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | [Карточка для шеринга](screens/share-card.html) · фраза onBreak на карточке слома, образец |


## Общие ключи после ревью

Старые дубли меню и отдельных кнопок «Повторить» удалены из реестра; используются `nav.*` и `common.retry`. `owner.strikes.profile` исключён: профиль не доступен владельцу продукта (User, A-54).

| ключ | ru | где |
|---|---|---|
| common.retry | Повторить | Ошибка загрузки на всех экранах |
| start.rating.note | Ты в общем рейтинге. Выйти можно в настройках. | Старт: parent-chosen, gender, condolence, phrases, phrases-mother |
| tasknew.checking.frozen | Форма на время проверки заморожена. | Постановка: checking |
| done.mark | Отметка в дневнике: выполнено | Готово; вместо числовой школьной оценки |
| shop.positive.title | Удары | Из боя с положительным балансом |
| shop.positive.body | Вернёшься в бой. Диалог и введённый текст сохранятся. | battle-positive |
| shop.positive.balance | {balance} | Положительный баланс; в макете query balance=1…5, по умолчанию 2 |
| more.privacy | Условия и конфиденциальность | Общая ссылка в «Ещё» |
| viewer.options | Состояния и варианты макета | Панель предпросмотра |
| viewer.state | Состояние | Панель предпросмотра |
| viewer.theme | Тема: Telegram / система, Светлая, Тёмная | Панель предпросмотра |
| viewer.role | Родитель: Отец, Мать | Панель предпросмотра |
| viewer.gender | Пол пользователя: Мужской, Женский | Панель предпросмотра |

`shop.title.battle` и `shop.battle.ctx` применяются только к `battle` (ноль с черновиком); при положительном балансе — `shop.positive.*`, без цитаты. Слово «проверка» в tasknew.checking.frozen означает временную проверку конкретности; текст кнопки уточняет «читает», а лимит не останавливает проверки прогресса.

## Добавленные состояния

Числа и названия — образцы; при реализации подставляются данные ответа API. Реплики — образцы категорий onDelete, onRetry, onCheckInReply, onSuccess.

| ключ | ru | где |
|---|---|---|
| fix.home.deleted.01 | Главная | [home#deleted](screens/home.html#deleted) |
| fix.home.deleted.02 | Задача удалена. Уважение не изменилось. | [home#deleted](screens/home.html#deleted) |
| fix.home.deleted.03 | Вычеркнули. Бумага стерпит. | [home#deleted](screens/home.html#deleted) |
| fix.home.deleted.04 | Батя | [home#deleted](screens/home.html#deleted) |
| fix.home.deleted.05 | К задачам | [home#deleted](screens/home.html#deleted) |
| fix.home.deleted.06 | Новая задача | [home#deleted](screens/home.html#deleted) |
| fix.home.stopped.01 | Главная | [home#stopped](screens/home.html#stopped) |
| fix.home.stopped.02 | Задача остановлена. Уважение не изменилось, прошлые периоды сохранены. | [home#stopped](screens/home.html#stopped) |
| fix.home.stopped.03 | Больше не спрашиваю. Сами договорились. | [home#stopped](screens/home.html#stopped) |
| fix.home.stopped.04 | Батя | [home#stopped](screens/home.html#stopped) |
| fix.home.stopped.05 | Посмотреть прошлые периоды | [home#stopped](screens/home.html#stopped) |
| fix.home.stopped.06 | К задачам | [home#stopped](screens/home.html#stopped) |
| fix.home.check-penalty.01 | Главная | [home#check-penalty](screens/home.html#check-penalty) |
| fix.home.check-penalty.02 | Проверка ждёт ответа | [home#check-penalty](screens/home.html#check-penalty) |
| fix.home.check-penalty.03 | За 15 минут ответа не было: −1 к уважению, 14 → 13. Ответить ещё можно, снятое уважение не вернётся. | [home#check-penalty](screens/home.html#check-penalty) |
| fix.home.check-penalty.04 | Ответить на проверку | [home#check-penalty](screens/home.html#check-penalty) |
| fix.home.check-penalty.05 | Все задачи | [home#check-penalty](screens/home.html#check-penalty) |
| fix.task.retry.01 | ← Задачи | [task#retry](screens/task.html#retry) |
| fix.task.retry.02 | Написать отчёт по продажам | [task#retry](screens/task.html#retry) |
| fix.task.retry.03 | Ещё час. Последний. Посмотрим, что у тебя получится. | [task#retry](screens/task.html#retry) |
| fix.task.retry.04 | Батя | [task#retry](screens/task.html#retry) |
| fix.task.retry.05 | Задача снова активна. Новый срок: сегодня, 19:10 (сейчас 18:10 + 1 час). | [task#retry](screens/task.html#retry) |
| fix.task.retry.06 | Снятое за провал уважение не возвращается. Повторной попытки по этой задаче больше нет. | [task#retry](screens/task.html#retry) |
| fix.task.retry.07 | Готово | [task#retry](screens/task.html#retry) |
| fix.task.retry.08 | К задаче | [task#retry](screens/task.html#retry) |
| fix.task.retry-period.01 | Повторять английский · пятница, 23 октября | [task#retry-period](screens/task.html#retry-period) |
| fix.task.retry-period.02 | Ещё час. Последний. Посмотрим, что у тебя получится. | [task#retry-period](screens/task.html#retry-period) |
| fix.task.retry-period.03 | Батя | [task#retry-period](screens/task.html#retry-period) |
| fix.task.retry-period.04 | Период снова активен. Сейчас 22:10, новый срок — 23:10. Следующий период начнётся в 00:00. Снятое уважение не возвращается. | [task#retry-period](screens/task.html#retry-period) |
| fix.task.retry-period.05 | Готово за сегодня | [task#retry-period](screens/task.html#retry-period) |
| fix.task.retry-period.06 | К периодам задачи | [task#retry-period](screens/task.html#retry-period) |
| fix.task.check-penalty.01 | ← Задачи | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.02 | Написать отчёт по продажам | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.03 | Покажи, что сделано. Две минуты. | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.04 | Батя | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.05 | За 15 минут ответа не было: −1 к уважению, 14 → 13. Ответить ещё можно, снятое уважение не вернётся. | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.06 | Сделано | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.07 | Частично | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.08 | Не начинал | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-penalty.09 | Не начинала | [task#check-penalty](screens/task.html#check-penalty) |
| fix.task.check-answered.01 | Ответ принят | [task#check-answered](screens/task.html#check-answered) |
| fix.task.check-answered.02 | Ладно. Скоро спрошу ещё. | [task#check-answered](screens/task.html#check-answered) |
| fix.task.check-answered.03 | Батя | [task#check-answered](screens/task.html#check-answered) |
| fix.task.check-answered.04 | Ответ сохранён. Уважение не изменилось; снятый штраф не возвращается. Следующая проверка серии — через 3–10 минут. | [task#check-answered](screens/task.html#check-answered) |
| fix.task.check-answered.05 | К задаче | [task#check-answered](screens/task.html#check-answered) |
| fix.task.confirm-period-giveup.01 | Повторять английский каждый день | [task#confirm-period-giveup](screens/task.html#confirm-period-giveup) |
| fix.task.confirm-period-giveup.02 | Сдаёшься на сегодня? | [task#confirm-period-giveup](screens/task.html#confirm-period-giveup) |
| fix.task.confirm-period-giveup.03 | Провалится только период за пятницу, 23 октября. Уважение упадёт на 1: с 14 до 13. Задача останется, завтра Батя спросит снова. | [task#confirm-period-giveup](screens/task.html#confirm-period-giveup) |
| fix.task.confirm-period-giveup.04 | Да, сдаюсь на сегодня | [task#confirm-period-giveup](screens/task.html#confirm-period-giveup) |
| fix.task.confirm-period-giveup.05 | Нет, продолжу | [task#confirm-period-giveup](screens/task.html#confirm-period-giveup) |
| fix.done.cap-zero.01 | Готово | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.02 | Написать отчёт по продажам | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.03 | ✓ Выполнено · средняя задача | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.04 | Вовремя. Что ж, нормально. | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.05 | Батя | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.06 | Уважение | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.07 | +0 · 94 → 94 | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.08 | Выше 94 уважение растёт только через бой. Закрытая задача засчитана в рейтинг. | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.09 | Сломать Батю | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.10 | Новая задача | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.cap-zero.11 | Поделиться | [done#cap-zero](screens/done.html#cap-zero) |
| fix.done.above-cap.01 | Готово | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.02 | Перевезти вещи из гаража на дачу | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.03 | ✓ Выполнено · большая задача | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.04 | Вовремя. Что ж, нормально. | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.05 | Батя | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.06 | Уважение | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.07 | +0 · 98 → 98 | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.08 | Выше 94 уважение растёт только через бой. Полученное за слом сохраняется, задача засчитана в рейтинг. | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.09 | Новая задача | [done#above-cap](screens/done.html#above-cap) |
| fix.done.above-cap.10 | Поделиться | [done#above-cap](screens/done.html#above-cap) |
| fix.fail.period-no-hour.01 | Период провален | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.02 | Повторять английский · пятница, 23 октября | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.03 | На сегодня всё. Завтра снова спрошу. | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.04 | Батя | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.05 | Уважение | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.06 | −2 · 14 → 12 | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.07 | Сейчас 23:30. Час уже не поместится до следующего периода: он начнётся в 00:00. Задача остаётся. | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.08 | Ответить | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.09 | Поделиться провалом | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-no-hour.10 | К задачам | [fail#period-no-hour](screens/fail.html#period-no-hour) |
| fix.fail.period-surrender.01 | Период провален | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.02 | На сегодня всё. Завтра снова спрошу. | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.03 | Батя | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.04 | Уважение | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.05 | −1 · 14 → 13 | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.06 | Провален только период за пятницу, 23 октября. Задача остаётся, следующий период начнётся в 00:00. | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.07 | Сделаю за час | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.08 | Ответить | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.fail.period-surrender.09 | Поделиться провалом | [fail#period-surrender](screens/fail.html#period-surrender) |
| fix.battle.half.01 | Бой | [battle#half](screens/battle.html#half) |
| fix.battle.half.02 | Ладно, в этом есть смысл. | [battle#half](screens/battle.html#half) |
| fix.battle.half.03 | Батя | [battle#half](screens/battle.html#half) |
| fix.battle.half.04 | Уважение 13 → 13 (+0,5). Уважение теперь 13,5; на шкале показана целая часть. Побеждённость 21 → 29 (+8). Списан 1 удар, осталось 2. | [battle#half](screens/battle.html#half) |
| fix.battle.half.05 | Продолжить бой | [battle#half](screens/battle.html#half) |
| fix.battle.no-gain.01 | Бой | [battle#no-gain](screens/battle.html#no-gain) |
| fix.battle.no-gain.02 | Это всё? Делом отвечай. | [battle#no-gain](screens/battle.html#no-gain) |
| fix.battle.no-gain.03 | Батя | [battle#no-gain](screens/battle.html#no-gain) |
| fix.battle.no-gain.04 | Уважение не изменилось: довод слабый. 13 → 13 (+0). Побеждённость 21 → 23 (+2). Списан 1 удар, осталось 2. | [battle#no-gain](screens/battle.html#no-gain) |
| fix.battle.no-gain.05 | Продолжить бой | [battle#no-gain](screens/battle.html#no-gain) |
| fix.battle.keyboard.01 | Бой | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.02 | Про отчёт надо было говорить до срока. Я слушаю. | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.03 | Батя | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.04 | Сейчас объясню по делу. | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.05 | Твоя реплика | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.06 | Одна реплика — 1 удар. До 300 символов. | [battle#keyboard](screens/battle.html#keyboard) |
| fix.battle.keyboard.07 | Отправить · 1 удар | [battle#keyboard](screens/battle.html#keyboard) |
| fix.history.confirm-rating.01 | История | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.02 | Записать оценку? | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.03 | Твой выбор: | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.04 | в самое больное | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.05 | . Оценить эту фразу можно один раз, изменить голос нельзя. | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.06 | Записать оценку | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.history.confirm-rating.07 | Вернуться к выбору | [history#confirm-rating](screens/history.html#confirm-rating) |
| fix.shop.battle-positive.01 | ← В бой | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.02 | Магазин · из боя | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.03 | Удары | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.04 | Баланс | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.05 | 2 | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.06 | ударов | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.07 | Вернёшься в бой. Диалог и введённый текст сохранятся. | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.08 | Пакет ударов | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.09 | 1 | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.10 | удар | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.11 | 15 Stars | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.12 | 15 за удар | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.13 | Выбрано | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.14 | 3 | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.15 | удара | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.16 | 39 Stars | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.17 | 13 за удар | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.18 | 5 | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.19 | 60 Stars | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.20 | 12 за удар | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.21 | Оплатить 39 Stars | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive.22 | Вернуться в бой | [shop#battle-positive](screens/shop.html#battle-positive) |
| fix.shop.battle-positive-ok.01 | Удары начислены | [shop#battle-positive-ok](screens/shop.html#battle-positive-ok) |
| fix.shop.battle-positive-ok.02 | К балансу добавлено 3 удара. Теперь: | [shop#battle-positive-ok](screens/shop.html#battle-positive-ok) |
| fix.shop.battle-positive-ok.03 | 5 | [shop#battle-positive-ok](screens/shop.html#battle-positive-ok) |
| fix.shop.battle-positive-ok.04 | . | [shop#battle-positive-ok](screens/shop.html#battle-positive-ok) |
| fix.shop.battle-positive-ok.05 | Вернуться в бой | [shop#battle-positive-ok](screens/shop.html#battle-positive-ok) |
| fix.settings.error.01 | Настройки | [settings#error](screens/settings.html#error) |
| fix.settings.error.02 | Настройки не загрузились. Проверь интернет и повтори. | [settings#error](screens/settings.html#error) |
| fix.settings.error.03 | Повторить | [settings#error](screens/settings.html#error) |
| fix.settings.error.04 | К разделу «Ещё» | [settings#error](screens/settings.html#error) |
| fix.settings.delete-error.01 | Удаление аккаунта | [settings#delete-error](screens/settings.html#delete-error) |
| fix.settings.delete-error.02 | Не удалось узнать результат удаления. Проверь интернет и обнови статус. До ответа сервера нельзя утверждать, что аккаунт сохранился. | [settings#delete-error](screens/settings.html#delete-error) |
| fix.settings.delete-error.03 | Обновить статус: аккаунт на месте | [settings#delete-error](screens/settings.html#delete-error) |
| fix.settings.delete-error.04 | Обновить статус: аккаунт удалён | [settings#delete-error](screens/settings.html#delete-error) |
| fix.settings.delete-not-done.01 | Аккаунт не удалён | [settings#delete-not-done](screens/settings.html#delete-not-done) |
| fix.settings.delete-not-done.02 | Аккаунт не удалён, всё на месте. Повтори или оставь как есть. | [settings#delete-not-done](screens/settings.html#delete-not-done) |
| fix.settings.delete-not-done.03 | Повторить удаление | [settings#delete-not-done](screens/settings.html#delete-not-done) |
| fix.settings.delete-not-done.04 | Оставить как есть | [settings#delete-not-done](screens/settings.html#delete-not-done) |
| fix.owner.user-missing.01 | Удары пользователя | [owner#user-missing](screens/owner.html#user-missing) |
| fix.owner.user-missing.02 | Пользователь с таким Telegram ID не найден. Проверь цифры и повтори поиск. | [owner#user-missing](screens/owner.html#user-missing) |
| fix.owner.user-missing.03 | Изменить ID | [owner#user-missing](screens/owner.html#user-missing) |
| fix.owner.over-balance.01 | Списание ударов | [owner#over-balance](screens/owner.html#over-balance) |
| fix.owner.over-balance.02 | Нельзя списать 8 ударов: на балансе 7. Баланс не изменился. Укажи число от 1 до 7. | [owner#over-balance](screens/owner.html#over-balance) |
| fix.owner.over-balance.03 | Исправить число | [owner#over-balance](screens/owner.html#over-balance) |
| fix.owner.paraphrases-loading.01 | Перефразы | [owner#paraphrases-loading](screens/owner.html#paraphrases-loading) |
| fix.owner.paraphrases-loading.02 | Фраза добавлена. Готовим перефразы, пользователи их пока не видят. | [owner#paraphrases-loading](screens/owner.html#paraphrases-loading) |
| fix.owner.paraphrases-loading.03 | К фразам: образец результата | [owner#paraphrases-loading](screens/owner.html#paraphrases-loading) |
| fix.owner.confirm-revoke.01 | Удары пользователя | [owner#confirm-revoke](screens/owner.html#confirm-revoke) |
| fix.owner.confirm-revoke.02 | Списать 2 удара? | [owner#confirm-revoke](screens/owner.html#confirm-revoke) |
| fix.owner.confirm-revoke.03 | Telegram ID 482190337 · @ivan_k. Было 7, станет 5. Причина: исправление ручного начисления. Операция попадёт в историю пользователя и журнал. | [owner#confirm-revoke](screens/owner.html#confirm-revoke) |
| fix.owner.confirm-revoke.04 | Да, списать 2 удара | [owner#confirm-revoke](screens/owner.html#confirm-revoke) |
| fix.owner.confirm-revoke.05 | Отмена | [owner#confirm-revoke](screens/owner.html#confirm-revoke) |
| fix.owner.confirm-prices.01 | Цены | [owner#confirm-prices](screens/owner.html#confirm-prices) |
| fix.owner.confirm-prices.02 | Сохранить цены для всех? | [owner#confirm-prices](screens/owner.html#confirm-prices) |
| fix.owner.confirm-prices.03 | 1 удар — 15 Stars; 3 — 39; 5 — 60. Новые цены применятся к новым счетам. Выставленные счета останутся по прежней цене. | [owner#confirm-prices](screens/owner.html#confirm-prices) |
| fix.owner.confirm-prices.04 | Сохранить цены | [owner#confirm-prices](screens/owner.html#confirm-prices) |
| fix.owner.confirm-prices.05 | Отмена | [owner#confirm-prices](screens/owner.html#confirm-prices) |
| fix.owner.confirm-reject.01 | Перефразы | [owner#confirm-reject](screens/owner.html#confirm-reject) |
| fix.owner.confirm-reject.02 | Отклонить перефраз? | [owner#confirm-reject](screens/owner.html#confirm-reject) |
| fix.owner.confirm-reject.03 | Этот вариант исчезнет из очереди и не будет показан пользователям. Исходная фраза останется. Отменить действие нельзя. | [owner#confirm-reject](screens/owner.html#confirm-reject) |
| fix.owner.confirm-reject.04 | Да, отклонить | [owner#confirm-reject](screens/owner.html#confirm-reject) |
| fix.owner.confirm-reject.05 | Отмена | [owner#confirm-reject](screens/owner.html#confirm-reject) |
| fix.owner.grant-done.01 | Начислено 2 удара | [owner#grant-done](screens/owner.html#grant-done) |
| fix.owner.grant-done.02 | Баланс: 7 → 9. Причина сохранена в истории пользователя и журнале. | [owner#grant-done](screens/owner.html#grant-done) |
| fix.owner.grant-done.03 | К операциям | [owner#grant-done](screens/owner.html#grant-done) |
| fix.owner.operation-done.01 | Списано 2 удара | [owner#operation-done](screens/owner.html#operation-done) |
| fix.owner.operation-done.02 | Баланс: 7 → 5. Причина сохранена в истории пользователя и журнале. | [owner#operation-done](screens/owner.html#operation-done) |
| fix.owner.operation-done.03 | К операциям | [owner#operation-done](screens/owner.html#operation-done) |
| fix.owner.prices-saved.01 | Цены сохранены | [owner#prices-saved](screens/owner.html#prices-saved) |
| fix.owner.prices-saved.02 | Новые счета будут выставлены по сохранённым ценам. Запись добавлена в журнал. | [owner#prices-saved](screens/owner.html#prices-saved) |
| fix.owner.prices-saved.03 | К ценам | [owner#prices-saved](screens/owner.html#prices-saved) |
| fix.owner.rejected.01 | Перефраз отклонён | [owner#rejected](screens/owner.html#rejected) |
| fix.owner.rejected.02 | Вариант удалён из очереди, исходная фраза на месте. | [owner#rejected](screens/owner.html#rejected) |
| fix.owner.rejected.03 | К фразам | [owner#rejected](screens/owner.html#rejected) |
| fix.share-card.creating-battle.01 | Карточка боя | [share-card#creating-battle](screens/share-card.html#creating-battle) |
| fix.share-card.creating-battle.02 | Карточка создаётся… | [share-card#creating-battle](screens/share-card.html#creating-battle) |
| fix.share-card.creating-battle.03 | Отмена: в бой | [share-card#creating-battle](screens/share-card.html#creating-battle) |
| fix.share-card.error-battle.01 | Карточка боя | [share-card#error-battle](screens/share-card.html#error-battle) |
| fix.share-card.error-battle.02 | Не получилось, ещё раз? Карточка не создалась, ничего не отправлено. | [share-card#error-battle](screens/share-card.html#error-battle) |
| fix.share-card.error-battle.03 | Повторить | [share-card#error-battle](screens/share-card.html#error-battle) |
| fix.share-card.error-battle.04 | Отмена: в бой | [share-card#error-battle](screens/share-card.html#error-battle) |
| fix.share-card.creating-fail.01 | Карточка провала | [share-card#creating-fail](screens/share-card.html#creating-fail) |
| fix.share-card.creating-fail.02 | Карточка создаётся… | [share-card#creating-fail](screens/share-card.html#creating-fail) |
| fix.share-card.creating-fail.03 | Отмена: к провалу | [share-card#creating-fail](screens/share-card.html#creating-fail) |
| fix.share-card.error-fail.01 | Карточка провала | [share-card#error-fail](screens/share-card.html#error-fail) |
| fix.share-card.error-fail.02 | Не получилось, ещё раз? Карточка не создалась, ничего не отправлено. | [share-card#error-fail](screens/share-card.html#error-fail) |
| fix.share-card.error-fail.03 | Повторить | [share-card#error-fail](screens/share-card.html#error-fail) |
| fix.share-card.error-fail.04 | Отмена: к провалу | [share-card#error-fail](screens/share-card.html#error-fail) |

## Варианты по родителю и полу

Название продукта «Батя» сохраняется. В обращениях к персонажу это отец; для матери используются «Мама» и согласованные формы. Системное «Вы» на старте сохранено по R-2, R-3 и N-1, персонаж говорит на «ты». Уже отправленные сообщения в продукте не меняются (R-13); переключатель макета меняет демонстрационный набор целиком, а не профиль. Историческая цитата хранит свою роль и пол.

| ключ | отец · м | отец · ж | мать · м | мать · ж |
|---|---|---|---|---|
| start.again.father | Снова начинаем. Я не удивлён. | Снова начинаем. Я не удивлён. | Снова начинаем. Я не удивлена. | Снова начинаем. Я не удивлена. |
| start.phrase1.male | Опять ничего сам не можешь? Ну, что тебе надо сделать? | Опять ничего сама не можешь? Ну, что тебе надо сделать? | Опять ничего сам не можешь? Ну, что тебе надо сделать? | Опять ничего сама не можешь? Ну, что тебе надо сделать? |
| start.speaker.father | Батя | Батя | Мама | Мама |
| tasknew.submit.busy | Батя читает… | Батя читает… | Мама читает… | Мама читает… |
| tasknew.success.phrase | Записал. Не подведи. | Записал. Не подведи. | Записала. Не подведи. | Записала. Не подведи. |
| tasknew.success.phrase.rec | Записал. Каждый день, без выходных на лень. | Записал. Каждый день, без выходных на лень. | Записала. Каждый день, без выходных на лень. | Записала. Каждый день, без выходных на лень. |
| tasknew.success.checks | Проверки начнутся не раньше чем через 3 минуты. Когда — Батя не скажет. | Проверки начнутся не раньше чем через 3 минуты. Когда — Батя не скажет. | Проверки начнутся не раньше чем через 3 минуты. Когда — Мама не скажет. | Проверки начнутся не раньше чем через 3 минуты. Когда — Мама не скажет. |
| home.respect.note | Выше 94 — только если сломать Батю в бою. | Выше 94 — только если сломать Батю в бою. | Выше 94 — только если сломать Маму в бою. | Выше 94 — только если сломать Маму в бою. |
| home.check.note | Спросил в {15:47} про «{название}». Без ответа 15 минут — минус 1 к уважению. | Спросил в {15:47} про «{название}». Без ответа 15 минут — минус 1 к уважению. | Спросила в {15:47} про «{название}». Без ответа 15 минут — минус 1 к уважению. | Спросила в {15:47} про «{название}». Без ответа 15 минут — минус 1 к уважению. |
| home.empty.phrase | Задач нет. Подозрительно. Ставь, пока я не придумал тебе сам. | Задач нет. Подозрительно. Ставь, пока я не придумал тебе сам. | Задач нет. Подозрительно. Ставь, пока я не придумала тебе сама. | Задач нет. Подозрительно. Ставь, пока я не придумала тебе сама. |
| home.error.banner | Не загрузилось. Задачи на месте, а вот связь с Батей нет. Проверь интернет и нажми «Повторить». | Не загрузилось. Задачи на месте, а вот связь с Батей нет. Проверь интернет и нажми «Повторить». | Не загрузилось. Задачи на месте, а вот связь с Мамой нет. Проверь интернет и нажми «Повторить». | Не загрузилось. Задачи на месте, а вот связь с Мамой нет. Проверь интернет и нажми «Повторить». |
| task.done.hint.rec | Закрывает только сегодняшний период. Завтра Батя спросит снова. | Закрывает только сегодняшний период. Завтра Батя спросит снова. | Закрывает только сегодняшний период. Завтра Мама спросит снова. | Закрывает только сегодняшний период. Завтра Мама спросит снова. |
| task.excuse.denied | Один час в сутки. Свой ты уже взял. Дальше сам. | Один час в сутки. Свой ты уже взяла. Дальше сама. | Один час в сутки. Свой ты уже взял. Дальше сам. | Один час в сутки. Свой ты уже взяла. Дальше сама. |
| task.check.note | Спросил в {15:47}. Без ответа до {16:02} — минус 1 к уважению. | Спросил в {15:47}. Без ответа до {16:02} — минус 1 к уважению. | Спросила в {15:47}. Без ответа до {16:02} — минус 1 к уважению. | Спросила в {15:47}. Без ответа до {16:02} — минус 1 к уважению. |
| task.check.notstarted | Не начинал | Не начинала | Не начинал | Не начинала |
| task.check.hint | «Сделано» закрывает задачу: +{1 / 3 / 5}. «Частично» и «Не начинал» уважение не меняют, но Батя спросит ещё раз. | «Сделано» закрывает задачу: +{1 / 3 / 5}. «Частично» и «Не начинала» уважение не меняют, но Батя спросит ещё раз. | «Сделано» закрывает задачу: +{1 / 3 / 5}. «Частично» и «Не начинал» уважение не меняют, но Мама спросит ещё раз. | «Сделано» закрывает задачу: +{1 / 3 / 5}. «Частично» и «Не начинала» уважение не меняют, но Мама спросит ещё раз. |
| task.giveup.confirm.body | Задача станет проваленной, уважение упадёт на 1: с {14} до {13}. Вернуть снятое нельзя, Батя запишет в дневник. | Задача станет проваленной, уважение упадёт на 1: с {14} до {13}. Вернуть снятое нельзя, Батя запишет в дневник. | Задача станет проваленной, уважение упадёт на 1: с {14} до {13}. Вернуть снятое нельзя, Мама запишет в дневник. | Задача станет проваленной, уважение упадёт на 1: с {14} до {13}. Вернуть снятое нельзя, Мама запишет в дневник. |
| task.error.banner | Не загрузилось. Задача никуда не делась, просто Батя не дозвонился. Проверь интернет и нажми «Повторить». | Не загрузилось. Задача никуда не делась, просто Батя не дозвонился. Проверь интернет и нажми «Повторить». | Не загрузилось. Задача никуда не делась, просто Мама не дозвонилась. Проверь интернет и нажми «Повторить». | Не загрузилось. Задача никуда не делась, просто Мама не дозвонилась. Проверь интернет и нажми «Повторить». |
| done.quote.micro | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделала. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделала. Невелик подвиг, но с чего-то же надо начинать. Засчитано. |
| done.quote.medium | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привыкла я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привыкла я такое говорить, поэтому скажу один раз: нормально. |
| done.quote.large | Большое дело, и ничего не развалил. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко. | Большое дело, и ничего не развалила. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко. | Большое дело, и ничего не развалил. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко. | Большое дело, и ничего не развалила. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко. |
| done.quote.cap | Сдал. Что ж, и такое бывает. Дальше сам. | Сдала. Что ж, и такое бывает. Дальше сама. | Сдал. Что ж, и такое бывает. Дальше сам. | Сдала. Что ж, и такое бывает. Дальше сама. |
| done.quote.daily | Сегодня сделал. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь. | Сегодня сделала. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь. | Сегодня сделал. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь. | Сегодня сделала. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь. |
| done.who.father | Батя | Батя | Мама | Мама |
| done.cap.note | За большую задачу положено +5, засчитан +1: выше 94 уважение растёт только если сломать Батю в бою. | За большую задачу положено +5, засчитан +1: выше 94 уважение растёт только если сломать Батю в бою. | За большую задачу положено +5, засчитан +1: выше 94 уважение растёт только если сломать Маму в бою. | За большую задачу положено +5, засчитан +1: выше 94 уважение растёт только если сломать Маму в бою. |
| done.cap.battle | Сломать Батю | Сломать Батю | Сломать Маму | Сломать Маму |
| done.next.quiet | До {дня недели} Батя по этой задаче молчит: ни проверок, ни напоминаний. | До {дня недели} Батя по этой задаче молчит: ни проверок, ни напоминаний. | До {дня недели} Мама по этой задаче молчит: ни проверок, ни напоминаний. | До {дня недели} Мама по этой задаче молчит: ни проверок, ни напоминаний. |
| done.late.note | «Сделаю за час» работает один раз на задачу. Если час уже брал, остаётся только новая задача. | «Сделаю за час» работает один раз на задачу. Если час уже брала, остаётся только новая задача. | «Сделаю за час» работает один раз на задачу. Если час уже брал, остаётся только новая задача. | «Сделаю за час» работает один раз на задачу. Если час уже брала, остаётся только новая задача. |
| fail.quote.deadline | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенная. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенная. |
| fail.quote.surrender | Сам сдался, сам и расскажешь, почему. Гараж подождёт. Он привык. | Сама сдалась, сама и расскажешь, почему. Гараж подождёт. Он привык. | Сам сдался, сам и расскажешь, почему. Гараж подождёт. Он привык. | Сама сдалась, сама и расскажешь, почему. Гараж подождёт. Он привык. |
| error.load | Не загрузилось. Бате не до тебя, сеть тоже отвалилась. Проверь интернет и нажми «Повторить». | Не загрузилось. Бате не до тебя, сеть тоже отвалилась. Проверь интернет и нажми «Повторить». | Не загрузилось. Маме не до тебя, сеть тоже отвалилась. Проверь интернет и нажми «Повторить». | Не загрузилось. Маме не до тебя, сеть тоже отвалилась. Проверь интернет и нажми «Повторить». |
| battle.title.father | Батя | Батя | Мама | Мама |
| battle.mode.confusion | Сбит с толку | Сбит с толку | Сбита с толку | Сбита с толку |
| battle.mode.softening | Смягчился | Смягчился | Смягчилась | Смягчилась |
| battle.mode.broken | Сломлен | Сломлен | Сломлена | Сломлена |
| battle.log.father | Диалог с Батей | Диалог с Батей | Диалог с Мамой | Диалог с Мамой |
| battle.who.father | Батя | Батя | Мама | Мама |
| battle.start.sample | Ну что, пришёл разговаривать? Я слушаю. Недолго. | Ну что, пришла разговаривать? Я слушаю. Недолго. | Ну что, пришёл разговаривать? Я слушаю. Недолго. | Ну что, пришла разговаривать? Я слушаю. Недолго. |
| battle.sample.feed1 | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенная. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы квартальный отчёт сдавал до обеда. Но ты у нас особенная. |
| battle.sample.defense | Ты на отца не огрызайся. Я эту семью кормил, пока ты в песочнице сидел. Равные условия ему подавай. | Ты на отца не огрызайся. Я эту семью кормил, пока ты в песочнице сидела. Равные условия ему подавай. | Ты на мать не огрызайся. Я эту семью кормила, пока ты в песочнице сидел. Равные условия ему подавай. | Ты на мать не огрызайся. Я эту семью кормила, пока ты в песочнице сидела. Равные условия ему подавай. |
| battle.sample.confusion | Погоди. Я не кричал. Я повышал голос. Это другое. Ты к чему вообще клонишь? | Погоди. Я не кричал. Я повышал голос. Это другое. Ты к чему вообще клонишь? | Погоди. Я не кричала. Я повышала голос. Это другое. Ты к чему вообще клонишь? | Погоди. Я не кричала. Я повышала голос. Это другое. Ты к чему вообще клонишь? |
| battle.sample.break | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | Ну... Я просто хотела как лучше. Вот и всё, что я хотела сказать. | Ну... Я просто хотела как лучше. Вот и всё, что я хотела сказать. |
| battle.sample.recovery | Явился. Отдохнул я, пока тебя не было, и снова за своё. Что у тебя с задачами? | Явилась. Отдохнул я, пока тебя не было, и снова за своё. Что у тебя с задачами? | Явился. Отдохнула я, пока тебя не было, и снова за своё. Что у тебя с задачами? | Явилась. Отдохнула я, пока тебя не было, и снова за своё. Что у тебя с задачами? |
| battle.howto.body | Пиши по делу: Батя засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и Батя сломлен. | Пиши по делу: Батя засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и Батя сломлен. | Пиши по делу: Мама засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и Мама сломлена. | Пиши по делу: Мама засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и Мама сломлена. |
| battle.input.placeholderSoft | Бой продолжается: Батя смягчён, но слушает. | Бой продолжается: Батя смягчён, но слушает. | Бой продолжается: Мама смягчена, но слушает. | Бой продолжается: Мама смягчена, но слушает. |
| battle.input.hintBusy | Пока Батя отвечает, новую реплику не отправить. | Пока Батя отвечает, новую реплику не отправить. | Пока Мама отвечает, новую реплику не отправить. | Пока Мама отвечает, новую реплику не отправить. |
| battle.send.busy | Батя отвечает… | Батя отвечает… | Мама отвечает… | Мама отвечает… |
| battle.typing | Батя печатает… | Батя печатает… | Мама печатает… | Мама печатает… |
| battle.break.stamp | Батя сломлен | Батя сломлен | Мама сломлена | Мама сломлена |
| battle.break.body | Уважение +12: {до} → {после}. Батя на несколько дней мягче, проверки реже. | Уважение +12: {до} → {после}. Батя на несколько дней мягче, проверки реже. | Уважение +12: {до} → {после}. Мама на несколько дней мягче, проверки реже. | Уважение +12: {до} → {после}. Мама на несколько дней мягче, проверки реже. |
| battle.turnErr.timeout | Батя не ответил за 30 секунд. Шкалы остались прежними, реплика на месте: отправь ещё раз. | Батя не ответил за 30 секунд. Шкалы остались прежними, реплика на месте: отправь ещё раз. | Мама не ответила за 30 секунд. Шкалы остались прежними, реплика на месте: отправь ещё раз. | Мама не ответила за 30 секунд. Шкалы остались прежними, реплика на месте: отправь ещё раз. |
| battle.error.body | Батя ждёт, но диалог не открылся: сеть отвалилась. История цела. Проверь интернет и нажми «Повторить». | Батя ждёт, но диалог не открылся: сеть отвалилась. История цела. Проверь интернет и нажми «Повторить». | Мама ждёт, но диалог не открылся: сеть отвалилась. История цела. Проверь интернет и нажми «Повторить». | Мама ждёт, но диалог не открылся: сеть отвалилась. История цела. Проверь интернет и нажми «Повторить». |
| history.lead | Всё, что Батя тебе сказал, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя. | Всё, что Батя тебе сказал, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя. | Всё, что Мама тебе сказала, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя. | Всё, что Мама тебе сказала, от новых к старым. Оценить фразу можно один раз, изменить оценку нельзя. |
| history.lead.short | Всё, что Батя тебе сказал, от новых к старым. | Всё, что Батя тебе сказал, от новых к старым. | Всё, что Мама тебе сказала, от новых к старым. | Всё, что Мама тебе сказала, от новых к старым. |
| history.who.father | Батя | Батя | Мама | Мама |
| history.cat.absent | Давно не заходил | Давно не заходила | Давно не заходил | Давно не заходила |
| history.checkin.answer | Ты ответил: {ответ} | Ты ответила: {ответ} | Ты ответил: {ответ} | Ты ответила: {ответ} |
| history.checkin.notStarted | не начинал(а) | не начинала(а) | не начинал(а) | не начинала(а) |
| history.empty.body | Напоминания, проверки и упрёки появятся здесь, когда будет что проверять. Поставь первую задачу, и Батя найдёт, что сказать. | Напоминания, проверки и упрёки появятся здесь, когда будет что проверять. Поставь первую задачу, и Батя найдёт, что сказать. | Напоминания, проверки и упрёки появятся здесь, когда будет что проверять. Поставь первую задачу, и Мама найдёт, что сказать. | Напоминания, проверки и упрёки появятся здесь, когда будет что проверять. Поставь первую задачу, и Мама найдёт, что сказать. |
| history.error.body | Батя всё помнит, а вот история не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». | Батя всё помнит, а вот история не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». | Мама всё помнит, а вот история не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». | Мама всё помнит, а вот история не открылась: сеть отвалилась. Проверь интернет и нажми «Повторить». |
| history.sample.reminder | Я тебе говорил, а ты так и не сделал «{task}». Осталось 1 ч 30 мин. | Я тебе говорил, а ты так и не сделала «{task}». Осталось 1 ч 30 мин. | Я тебе говорила, а ты так и не сделал «{task}». Осталось 1 ч 30 мин. | Я тебе говорила, а ты так и не сделала «{task}». Осталось 1 ч 30 мин. |
| history.sample.success | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделала. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано. | Сделала. Невелик подвиг, но с чего-то же надо начинать. Засчитано. |
| history.sample.taskSet | Записал. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься. | Записал. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься. | Записала. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься. | Записала. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься. |
| history.sample.reminder2 | Осталось 2 часа. Зарядка не для Бати, она для твоей спины. Хотя что я говорю. | Осталось 2 часа. Зарядка не для Бати, она для твоей спины. Хотя что я говорю. | Осталось 2 часа. Зарядка не для Мамы, она для твоей спины. Хотя что я говорю. | Осталось 2 часа. Зарядка не для Мамы, она для твоей спины. Хотя что я говорю. |
| history.sample.start1 | Опять ничего сам не можешь? Ну, что тебе надо сделать? | Опять ничего сама не можешь? Ну, что тебе надо сделать? | Опять ничего сам не можешь? Ну, что тебе надо сделать? | Опять ничего сама не можешь? Ну, что тебе надо сделать? |
| shop.lead | Один удар — одна твоя реплика Бате в бою. Молчать пока бесплатно. | Один удар — одна твоя реплика Бате в бою. Молчать пока бесплатно. | Один удар — одна твоя реплика Маме в бою. Молчать пока бесплатно. | Один удар — одна твоя реплика Маме в бою. Молчать пока бесплатно. |
| shop.lead.empty | Один удар — одна твоя реплика Бате в бою. Пока молчишь, он считает, что прав. | Один удар — одна твоя реплика Бате в бою. Пока молчишь, он считает, что прав. | Один удар — одна твоя реплика Маме в бою. Пока молчишь, она считает, что права. | Один удар — одна твоя реплика Маме в бою. Пока молчишь, она считает, что права. |
| shop.pending.back | Закрыл окно оплаты? Вернуться к выбору | Закрыла окно оплаты? Вернуться к выбору | Закрыл окно оплаты? Вернуться к выбору | Закрыла окно оплаты? Вернуться к выбору |
| shop.success.body | Было {before}, стало {after}. Батя уже готовится. | Было {before}, стало {after}. Батя уже готовится. | Было {before}, стало {after}. Мама уже готовится. | Было {before}, стало {after}. Мама уже готовится. |
| shop.success.battle | Ответить Бате | Ответить Бате | Ответить Маме | Ответить Маме |
| settings.saved | Сохранено. Батя принял к сведению. | Сохранено. Батя принял к сведению. | Сохранено. Мама приняла к сведению. | Сохранено. Мама приняла к сведению. |
| settings.del1.body | Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Батя даже не попрощается. | Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Батя даже не попрощается. | Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Мама даже не попрощается. | Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Мама даже не попрощается. |
| settings.deleted.quote | Задачи стёрты, лента пуста, бот больше не напишет. Хотя Батя, конечно, не такой, чтобы навязываться. | Задачи стёрты, лента пуста, бот больше не напишет. Хотя Батя, конечно, не такой, чтобы навязываться. | Задачи стёрты, лента пуста, бот больше не напишет. Хотя Мама, конечно, не такая, чтобы навязываться. | Задачи стёрты, лента пуста, бот больше не напишет. Хотя Мама, конечно, не такая, чтобы навязываться. |
| settings.deleted.who | Батя | Батя | Мама | Мама |
| owner.denied.body | Батя здесь один, и это не ты. Ничего не изменилось, твои данные на месте. | Батя здесь один, и это не ты. Ничего не изменилось, твои данные на месте. | Мама здесь одна, и это не ты. Ничего не изменилось, твои данные на месте. | Мама здесь одна, и это не ты. Ничего не изменилось, твои данные на месте. |
| more.shop.sub | Чтобы ответить Бате, нужны удары | Чтобы ответить Бате, нужны удары | Чтобы ответить Маме, нужны удары | Чтобы ответить Маме, нужны удары |
| more.shop.sub.zero | Ударов нет, отвечать Бате нечем | Ударов нет, отвечать Бате нечем | Ударов нет, отвечать Маме нечем | Ударов нет, отвечать Маме нечем |
| share.note.done | На карточке нет твоего имени, username и названия задачи. Только фраза Бати и ссылка на бота. | На карточке нет твоего имени, username и названия задачи. Только фраза Бати и ссылка на бота. | На карточке нет твоего имени, username и названия задачи. Только фраза Мамы и ссылка на бота. | На карточке нет твоего имени, username и названия задачи. Только фраза Мамы и ссылка на бота. |
| share.note.break | Ответы нейросети на карточку не попадают: только финальная фраза Бати из заготовленных. | Ответы нейросети на карточку не попадают: только финальная фраза Бати из заготовленных. | Ответы нейросети на карточку не попадают: только финальная фраза Мамы из заготовленных. | Ответы нейросети на карточку не попадают: только финальная фраза Мамы из заготовленных. |
| share.note.gender | Вместо имени стоит «дочка» или «сынок» по твоему полу. | Вместо имени стоит «дочка» или «дочка» по твоему полу. | Вместо имени стоит «дочка» или «сынок» по твоему полу. | Вместо имени стоит «дочка» или «дочка» по твоему полу. |
| share.creating | Батя берёт ручку… | Батя берёт ручку… | Мама берёт ручку… | Мама берёт ручку… |
| share.card.sign.father | — Батя | — Батя | — Мама | — Мама |
| share.card.stamp.break | Сломлен | Сломлен | Сломлена | Сломлена |
| share.card.alt.break | Карточка для чата. Дневник, родитель: {роль}, степень победы 100, уровень 4 из 4, штамп «Сломлен». Фраза: {фраза}. Подпись: {подпись}. | Карточка для чата. Дневник, родитель: {роль}, степень победы 100, уровень 4 из 4, штамп «Сломлен». Фраза: {фраза}. Подпись: {подпись}. | Карточка для чата. Дневник, родитель: {роль}, степень победы 100, уровень 4 из 4, штамп «Сломлена». Фраза: {фраза}. Подпись: {подпись}. | Карточка для чата. Дневник, родитель: {роль}, степень победы 100, уровень 4 из 4, штамп «Сломлена». Фраза: {фраза}. Подпись: {подпись}. |
| share.phrase.done | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привыкла я такое говорить, поэтому скажу один раз: нормально. | Вовремя. Надо же. Не привыкла я такое говорить, поэтому скажу один раз: нормально. |
| share.phrase.fail | Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенная. | Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенный. | Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенная. |
| share.phrase.battleStart | Ну что, пришёл разговаривать? Я слушаю. Недолго. | Ну что, пришла разговаривать? Я слушаю. Недолго. | Ну что, пришёл разговаривать? Я слушаю. Недолго. | Ну что, пришла разговаривать? Я слушаю. Недолго. |
| share.phrase.break | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать. | Ну... Я просто хотела как лучше. Вот и всё, что я хотела сказать. | Ну... Я просто хотела как лучше. Вот и всё, что я хотела сказать. |
| fix.home.deleted.04 | Батя | Батя | Мама | Мама |
| fix.home.stopped.04 | Батя | Батя | Мама | Мама |
| fix.task.retry.04 | Батя | Батя | Мама | Мама |
| fix.task.retry-period.03 | Батя | Батя | Мама | Мама |
| fix.task.check-penalty.04 | Батя | Батя | Мама | Мама |
| fix.task.check-penalty.08 | Не начинал | Не начинала | Не начинал | Не начинала |
| fix.task.check-penalty.09 | Не начинал | Не начинала | Не начинал | Не начинала |
| fix.task.check-answered.03 | Батя | Батя | Мама | Мама |
| fix.task.confirm-period-giveup.03 | Провалится только период за пятницу, 23 октября. Уважение упадёт на 1: с 14 до 13. Задача останется, завтра Батя спросит снова. | Провалится только период за пятницу, 23 октября. Уважение упадёт на 1: с 14 до 13. Задача останется, завтра Батя спросит снова. | Провалится только период за пятницу, 23 октября. Уважение упадёт на 1: с 14 до 13. Задача останется, завтра Мама спросит снова. | Провалится только период за пятницу, 23 октября. Уважение упадёт на 1: с 14 до 13. Задача останется, завтра Мама спросит снова. |
| fix.done.cap-zero.05 | Батя | Батя | Мама | Мама |
| fix.done.cap-zero.09 | Сломать Батю | Сломать Батю | Сломать Маму | Сломать Маму |
| fix.done.above-cap.05 | Батя | Батя | Мама | Мама |
| fix.fail.period-no-hour.04 | Батя | Батя | Мама | Мама |
| fix.fail.period-surrender.03 | Батя | Батя | Мама | Мама |
| fix.battle.half.03 | Батя | Батя | Мама | Мама |
| fix.battle.no-gain.03 | Батя | Батя | Мама | Мама |
| fix.battle.keyboard.03 | Батя | Батя | Мама | Мама |
