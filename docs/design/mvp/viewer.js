/* Статический просмотр, не продуктовый код: состояния, образцы роли/пола и тема. */
(function () {
  var root = document.documentElement, app = document.querySelector('.app');
  var memory = {};
  function readChoice(key) { try { return sessionStorage.getItem(key); } catch (e) { return memory[key] || null; } }
  function saveChoice(key, value) { memory[key] = value; try { sessionStorage.setItem(key, value); } catch (e) {} }
  var views = Array.from(document.querySelectorAll('[data-view]'));
  if (!views.length) return;
  var file = location.pathname.split('/').pop(), tg = window.Telegram && window.Telegram.WebApp;
  var role = readChoice('design-role') || 'father', gender = readChoice('design-gender') || 'male';
  var bar = document.createElement('div'); bar.className = 'viewer';
  bar.innerHTML = '<a href="../index.html">← Все экраны</a><details><summary>Состояния и варианты макета</summary><div class="stack"></div></details>';
  function select(label, options, value, change) {
    var wrap = document.createElement('label'), input = document.createElement('select'); wrap.textContent = label + ' ';
    options.forEach(function (o) { input.add(new Option(o[1], o[0])); }); input.value = value;
    input.addEventListener('change', function () { change(input.value); }); wrap.appendChild(input); bar.querySelector('.stack').appendChild(wrap); return input;
  }
  var state = select('Состояние', views.map(function (v) { return [v.dataset.view, v.dataset.label || v.dataset.view]; }), '', show);
  function autoTheme() { root.dataset.theme = tg ? tg.colorScheme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
  var theme = select('Тема', [['auto', 'Telegram / система'], ['light', 'Светлая'], ['dark', 'Тёмная']], 'auto', function (v) { if (v === 'auto') autoTheme(); else root.dataset.theme = v; }); autoTheme();
  if (tg && tg.onEvent) tg.onEvent('themeChanged', function () { if (theme.value === 'auto') autoTheme(); });
  /* Переключаем набор образцов, а не отправленные сообщения профиля (R-13). */
  var mother = [['Батя сломлен', 'Мама сломлена'], ['Батя смягчён', 'Мама смягчена'], ['Батя сбит с толку', 'Мама сбита с толку'], ['Батя смягчился', 'Мама смягчилась'], ['Батя не ответил', 'Мама не ответила'], ['Батя здесь один', 'Мама здесь одна'], ['Батя, конечно, не такой', 'Мама, конечно, не такая'], ['я не придумал тебе сам', 'я не придумала тебе сама'], ['Батя не такой', 'Мама не такая'], ['родитель: отец', 'родитель: мать'], ['Я тебя не для того растил', 'Я тебя не для того растила'], ['не удивлён.', 'не удивлена.'], ['Отдохнул я', 'Отдохнула я'], ['Батя тебе сказал', 'Мама тебе сказала'], ['Батя не дозвонился', 'Мама не дозвонилась'], ['Батей', 'Мамой'], ['Батю', 'Маму'], ['Бате', 'Маме'], ['Бати', 'Мамы'], ['Батя', 'Мама'], ['на отца', 'на мать'], ['с отцом', 'с матерью'], ['Я эту семью кормил', 'Я эту семью кормила'], ['Я не кричал', 'Я не кричала'], ['Я повышал', 'Я повышала'], ['Я просто хотел', 'Я просто хотела'], ['Не привык я', 'Не привыкла я'], ['Записал.', 'Записала.'], ['Спросил в', 'Спросила в'], ['Растерян', 'Растеряна'], ['Сбит с толку', 'Сбита с толку'], ['Смягчился', 'Смягчилась'], ['Сломлен', 'Сломлена']];
  var female = [['ты уже оценивал', 'ты уже оценивала'], ['Ты ответил', 'Ты ответила'], ['Закрыл окно', 'Закрыла окно'], ['час уже брал', 'час уже брала'], ['Не начинал', 'Не начинала'], ['не начинал', 'не начинала'], ['сам не можешь', 'сама не можешь'], ['Сам сдался', 'Сама сдалась'], ['сам и расскажешь', 'сама и расскажешь'], ['ты так и не сделал', 'ты так и не сделала'], ['Сделал.', 'Сделала.'], ['Сегодня сделал', 'Сегодня сделала'], ['Сдал.', 'Сдала.'], ['не развалил', 'не развалила'], ['Дальше сам.', 'Дальше сама.'], ['пришёл разговаривать', 'пришла разговаривать'], ['Зря не пришёл', 'Зря не пришла'], ['песочнице сидел', 'песочнице сидела'], ['Явился.', 'Явилась.'], ['Давно не заходил', 'Давно не заходила'], ['особенный', 'особенная'], ['сынок', 'дочка'], ['Сынок', 'Дочка'], ['Задачу сделал,', 'Задачу сделала,'], ['Свой ты уже взял.', 'Свой ты уже взяла.'], ['провалил задачу', 'провалила задачу'], ['ты оправдывался', 'ты оправдывалась'], ['ты снова откладывал', 'ты снова откладывала']];
  /* Эти формы относятся к родителю, независимо от пола пользователя. */
  mother.unshift(['Батя сломлен и смягчился', 'Мама сломлена и смягчилась'], ['Ты хотел как лучше', 'Ты хотела как лучше'], ['что я хотел сказать', 'что я хотела сказать'], ['Я тебе говорил', 'Я тебе говорила'], ['Зря не пришёл', 'Зря не пришла'], ['ты не пришёл на мой выпускной', 'ты не пришла на мой выпускной']);
  female = female.filter(function (p) { return p[0] !== 'Зря не пришёл'; });
  /* Закрытый набор сообщений из history.html; query принимает только ключ образца. */
  var historySamples = {
    reminder: ['Написать отчёт по продажам за октябрь', 'Я тебе говорил, а ты так и не сделал «Написать отчёт по продажам за октябрь». Осталось 1 ч 30 мин.'],
    check: ['Написать отчёт по продажам за октябрь', 'Ну что, показывай, что сделано. Или опять «потом»?'],
    garage: ['Убраться в гараже', 'Гараж не убран. Сергей из пятого подъезда свой уже перебрал и перекрасил.'],
    english: ['Повторять английский', 'Молчишь. Это ты так английский повторяешь? Тихо и без прогресса.'],
    absence: ['', 'Шесть часов тебя нет. Я не волнуюсь. Я просто отмечаю.'],
    praise: ['Ответить на письмо от бухгалтерии', 'Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано.'],
    'exercise-fail': ['Сделать зарядку · вторник', 'Вторник сам себя не сделает. Завтра новый день, и я опять спрошу.'],
    exercise: ['Сделать зарядку · вторник', 'Осталось 2 часа. Зарядка не для Бати, она для твоей спины. Хотя что я говорю.'],
    'moving-check': ['Перевезти вещи из гаража на дачу', 'Что сделано? Вещи сами в машину не сядут.'],
    moving: ['Перевезти вещи из гаража на дачу', 'Записал. Срок до субботы. Хотя что я говорю, ты и до понедельника не соберёшься.'],
    start: ['', 'Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко?'],
    'start-help': ['', 'Опять ничего сам не можешь? Ну, что тебе надо сделать?']
  };
  if (file === 'battle.html') {
    var messageKey = new URLSearchParams(location.search).get('message');
    var message = Object.prototype.hasOwnProperty.call(historySamples, messageKey) ? historySamples[messageKey] : historySamples.reminder;
    document.querySelectorAll('[data-history-task]').forEach(function (el) { el.textContent = message[0] ? 'К задаче: ' + message[0] : 'Без задачи'; });
    document.querySelectorAll('[data-history-quote]').forEach(function (el) { el.textContent = message[1]; });
  }
  var shareSamples = {
    'done-micro': 'Сделал. Невелик подвиг, но с чего-то же надо начинать. Засчитано.',
    'done-medium': 'Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально.',
    'done-large': 'Большое дело, и ничего не развалил. Ну, молодец. Только не зазнавайся, до Сергея из пятого подъезда тебе ещё далеко.',
    'done-cap': 'Сдал. Что ж, и такое бывает. Дальше сам.',
    'done-recurring': 'Сегодня сделал. Посмотрим, надолго ли тебя хватит. Меня на «завтра» не обманешь.',
    'done-weekdays': 'Почта разобрана. Только не говори, что это был труд. Это была почта.',
    'done-cap-zero': 'Вовремя. Что ж, нормально.', 'done-above-cap': 'Вовремя. Что ж, нормально.',
    'fail-normal': 'Сергей из пятого подъезда в твои годы задачу сдавал до обеда. Но ты у нас особенный.',
    'fail-surrender': 'Сам сдался, сам и расскажешь, почему. Задача подождёт. Она привыкла.',
    'fail-used': 'Час тебе давали. Час прошёл, результата нет. Дважды я одно и то же не повторяю.',
    'fail-period': 'Вторник сам себя не сделает. Завтра новый день, и я опять спрошу.',
    'fail-period-no-hour': 'На сегодня всё. Завтра снова спрошу.', 'fail-period-surrender': 'На сегодня всё. Завтра снова спрошу.'
  };
  var battleDegrees = {empty: 0, dialog: 21, answered: 43, confusion: 78, softening: 94, recovered: 50, 'break': 100, norew: 100};
  if (file === 'done.html' || file === 'fail.html' || file === 'battle.html') views.forEach(function (v) {
    var key = file.replace('.html', '') + '-' + v.dataset.view;
    v.querySelectorAll('a[href^="share-card.html"]').forEach(function (a) {
      if (Object.prototype.hasOwnProperty.call(shareSamples, key)) a.href = 'share-card.html?sample=' + key + (file === 'done.html' ? '#done' : '#fail');
      else if (file === 'battle.html' && Object.prototype.hasOwnProperty.call(battleDegrees, v.dataset.view)) a.href = 'share-card.html?battle=' + v.dataset.view + a.hash;
    });
  });
  if (file === 'share-card.html') {
    var shareQuery = new URLSearchParams(location.search), sampleKey = shareQuery.get('sample'), battleKey = shareQuery.get('battle');
    ['done', 'fail'].forEach(function (kind) {
      var section = views.find(function (v) { return v.dataset.view === kind; });
      var key = sampleKey && sampleKey.indexOf(kind + '-') === 0 && Object.prototype.hasOwnProperty.call(shareSamples, sampleKey) ? sampleKey : kind + (kind === 'done' ? '-medium' : '-normal');
      var phrase = shareSamples[key], leaf = section.querySelector('.leaf');
      section.querySelector('.leaf-phrase').textContent = phrase;
      leaf.setAttribute('aria-label', leaf.getAttribute('aria-label').split('Фраза:')[0] + 'Фраза: ' + phrase + ' Подпись: Батя.');
      section.querySelector('a.btn.link').href = kind + '.html#' + key.slice(kind.length + 1);
    });
    if (Object.prototype.hasOwnProperty.call(battleDegrees, battleKey)) {
      var degree = battleDegrees[battleKey];
      var cardState = degree === 100 ? 'break' : degree < 20 ? 'battle1' : degree < 50 ? 'battle2' : degree < 80 ? 'battle3' : 'battle4';
      views.filter(function (v) { return v.dataset.view === cardState; }).forEach(function (v) {
        var number = v.querySelector('.deg'); if (number) number.textContent = degree;
        var leaf = v.querySelector('.leaf'); leaf.setAttribute('aria-label', leaf.getAttribute('aria-label').replace(/степень победы [0-9]+/, 'степень победы ' + degree));
        v.querySelector('a.btn.link').href = 'battle.html#' + battleKey;
        if (battleKey === 'norew') { var phrase = 'Помню. Зря не пришёл. Я просто хотел как лучше. Опять.'; v.querySelector('.leaf-phrase').textContent = phrase; leaf.setAttribute('aria-label', leaf.getAttribute('aria-label').split('Фраза:')[0] + 'Фраза: ' + phrase + ' Подпись: Батя.'); }
      });
    }
  }
  var originals = [], walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) { if (!walker.currentNode.parentElement.closest('script, style, .for-father, .for-mother, .for-male, .for-female')) originals.push([walker.currentNode, walker.currentNode.nodeValue]); }
  var attrs = Array.from(document.querySelectorAll('[placeholder], [aria-label]')).map(function (el) { return [el, el.getAttribute('placeholder'), el.getAttribute('aria-label')]; });
  function variant(text) { (role === 'mother' ? mother : []).concat(gender === 'female' ? female : []).forEach(function (p) { text = text.split(p[0]).join(p[1]); }); return text; }
  function variants() { root.dataset.role = role; root.dataset.gender = gender; originals.forEach(function (p) { p[0].nodeValue = role === 'mother' && p[1] === 'Отец' && p[0].parentElement.matches('.leaf-role .v') ? 'Мать' : variant(p[1]); }); attrs.forEach(function (p) { if (p[1]) p[0].setAttribute('placeholder', variant(p[1])); if (p[2]) p[0].setAttribute('aria-label', variant(p[2])); }); if (file === 'shop.html' && initialized) purchaseResult(views.find(function (v) { return !v.hidden; })); }
  select('Родитель', [['father', 'Отец'], ['mother', 'Мать']], role, function (v) { role = v; saveChoice('design-role', v); variants(); });
  select('Пол пользователя', [['male', 'Мужской'], ['female', 'Женский']], gender, function (v) { gender = v; saveChoice('design-gender', v); variants(); });
  document.body.insertBefore(bar, document.body.firstChild);
  var nav = document.querySelector('.tabbar');
  if (!nav && ['done.html', 'fail.html'].includes(file)) {
    nav = document.createElement('nav'); nav.className = 'tabbar'; nav.setAttribute('aria-label', 'Основное меню');
    [['home', 'Главная'], ['battle', 'Бой'], ['history', 'История'], ['leaderboard', 'Рейтинг'], ['more', 'Ещё']].forEach(function (p) { var a = document.createElement('a'); a.href = p[0] + '.html'; a.innerHTML = '<span class="ico" aria-hidden="true"></span>' + p[1]; nav.appendChild(a); }); app.appendChild(nav);
  }
  var icons = ['M4 3h16v18H4z M8 3v18 M11 8h6 M11 12h6 M11 16h4', 'M5 20l3-8 4-3 2-6 3 1v7l3 4-3 5z', 'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h6', 'M4 21V13h4v8 M10 21V4h4v17 M16 21V9h4v12', 'M5 6h14 M5 12h14 M5 18h14'];
  document.querySelectorAll('.tabbar .ico').forEach(function (el, i) { el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + icons[i % 5] + '"/></svg>'; });
  views.forEach(function (v) { if (!v.querySelector('h1')) { var h = document.createElement('h1'); h.className = 'sr-only'; h.textContent = document.title + ' · ' + v.dataset.label; v.insertBefore(h, v.firstChild); } });
  function selected() { document.querySelectorAll('.seg label, .chips label, .pack, .opt').forEach(function (label) { var input = label.querySelector('input'); label.classList.toggle('is-selected', !!input && input.checked); }); }
  document.addEventListener('change', selected); selected();
  document.addEventListener('change', function (e) { if (e.target.matches('input[value="revoke"], input[value="grant"]')) { var button = e.target.closest('form').querySelector('.operation-submit'); if (button) { button.textContent = e.target.value === 'revoke' ? 'Списать 2 удара' : 'Начислить 2 удара'; button.dataset.go = e.target.value === 'revoke' ? '#confirm-revoke' : '#grant-done'; } } });
  var modalReturn = null, modalInvoker = null, initialized = false;
  function show(name, invoker) {
    if (!views.some(function (v) { return v.dataset.view === name; })) name = views[0].dataset.view;
    var previous = initialized ? views.find(function (v) { return !v.hidden; }) : null;
    var target = views.find(function (v) { return v.dataset.view === name; });
    if (file === 'task.html' && name === 'recurring-earlier' && previous && ['recurring', 'rec-extended'].includes(previous.dataset.view)) target.querySelector('.back').href = '#' + previous.dataset.view;
    if (target.querySelector('.sheet') && previous !== target) {
      modalReturn = previous && !previous.querySelector('.sheet') ? previous.dataset.view : null;
      modalInvoker = modalReturn && previous.contains(invoker || document.activeElement) ? (invoker || document.activeElement) : null;
    }
    var closing = previous && previous.querySelector('.sheet') && !target.querySelector('.sheet');
    views.forEach(function (v) { v.hidden = v.dataset.view !== name; }); state.value = name;
    var current = views.find(function (v) { return !v.hidden; }), modal = current.querySelector('.sheet[role="dialog"], .sheet[role="alertdialog"]');
    app.classList.toggle('modal-open', !!modal); app.classList.toggle('keyboard-open', name === 'keyboard'); if (nav) nav.hidden = !!modal || current.hasAttribute('data-no-tabbar') || name === 'deleted' || name === 'keyboard';
    current.querySelectorAll('[inert]').forEach(function (el) { el.inert = false; });
    if (modal) { modal.setAttribute('aria-modal', 'true'); Array.from(current.children).forEach(function (el) { if (el !== modal && !el.contains(modal)) el.inert = true; }); var first = modal.querySelector('button, a, input'); if (first) first.focus(); }
    if (closing) { var focus = modalInvoker && current.contains(modalInvoker) ? modalInvoker : current.querySelector('h1'); if (focus) { if (focus.tagName === 'H1') focus.tabIndex = -1; focus.focus(); } modalReturn = null; modalInvoker = null; }
    initialized = true;
    history.replaceState(null, '', '#' + name);
    if (file === 'shop.html') purchaseResult(current);
  }
  function back() { var current = views.find(function (v) { return !v.hidden; }); if (file === 'start.html' && current.dataset.view === 'tz') { location.href = 'home.html'; return; } var cancel = Array.from(current.querySelectorAll('.sheet a[href^="#"]')).find(function (a) { return ['Отмена', 'Не удалять', 'Нет, продолжу', 'Пусть идёт'].includes(a.textContent.trim()); }); show(modalReturn || (cancel ? cancel.hash.slice(1) : views[0].dataset.view)); }
  if (tg && tg.BackButton) { tg.BackButton.show(); tg.BackButton.onClick(back); }
  document.addEventListener('keydown', function (e) {
    var modal = document.querySelector('[data-view]:not([hidden]) .sheet[aria-modal="true"]'); if (!modal) return;
    if (e.key === 'Escape') { e.preventDefault(); back(); }
    if (e.key === 'Tab') { var items = Array.from(modal.querySelectorAll('a, button:not([disabled]), input:not([disabled]), select')), first = items[0], last = items[items.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  document.addEventListener('click', function (e) {
    var rate = e.target.closest('.rate-btns button:not([disabled])');
    if (rate && file === 'history.html') { document.querySelectorAll('[data-rating-choice]').forEach(function (el) { el.textContent = rate.textContent; }); var chosen = rate.textContent; document.querySelectorAll('[data-view="again"] .rate-btns button').forEach(function (el) { var text = el.textContent.replace('✓ ', ''); el.textContent = (text === chosen ? '✓ ' : '') + text; el.setAttribute('aria-pressed', text === chosen ? 'true' : 'false'); }); show('confirm-rating'); }
    var a = e.target.closest('a[href^="#"]');
    if (a && a.closest('.sheet') && ['Отмена', 'Не удалять', 'Нет, продолжу', 'Пусть идёт'].includes(a.textContent.trim())) { e.preventDefault(); back(); return; }
    if (a && views.some(function (v) { return '#' + v.dataset.view === a.getAttribute('href'); })) { e.preventDefault(); show(a.hash.slice(1), a); return; }
    var b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); var local = b.dataset.go.replace(/^#/, ''); if (views.some(function (v) { return v.dataset.view === local; })) show(local, b); else location.href = b.dataset.go; }
  });
  document.addEventListener('focusin', function (e) { if (e.target.closest('.composer')) app.classList.add('keyboard-open'); });
  document.addEventListener('focusout', function (e) { if (e.target.closest('.composer')) app.classList.remove('keyboard-open'); });
  var query = new URLSearchParams(location.search), rawBalance = query.get('balance');
  var balance = rawBalance === null ? 2 : Number(rawBalance);
  if (!Number.isFinite(balance) || balance < 0 || balance > 1000) balance = 2;
  var source = query.get('from') || (location.hash === '#battle' ? 'zero' : 'dialog');
  if (!/^[a-z-]+$/.test(source)) source = 'dialog';
  document.querySelectorAll('[data-battle-unit]').forEach(function (el) { el.textContent = balance === 1 ? 'удар' : balance >= 2 && balance <= 4 ? 'удара' : 'ударов'; });
  document.querySelectorAll('[data-battle-back]').forEach(function (el) { el.href = 'battle.html?balance=' + balance + '#' + source; });
  if (file === 'battle.html' && rawBalance !== null) document.querySelectorAll('.bal > span > b').forEach(function (el) { el.textContent = balance; });
  document.addEventListener('input', function (e) { if (e.target.matches('.composer textarea')) saveChoice('design-draft-' + role, e.target.value); });
  if (file === 'battle.html') { var draft = readChoice('design-draft-' + role); if (draft !== null) document.querySelectorAll('.composer textarea:not([disabled])').forEach(function (el) { el.value = draft; }); }
  document.querySelectorAll('[data-battle-balance]').forEach(function (el) { el.textContent = balance; });
  function purchaseResult(current) {
    var checked = document.querySelector('[data-view="battle-positive"] .packs input:checked');
    var pack = checked ? Number(checked.value) : 3, price = {1: 15, 3: 39, 5: 60}[pack];
    var total = balance + pack, unit = total % 100 >= 11 && total % 100 <= 14 ? 'ударов' : total % 10 === 1 ? 'удар' : total % 10 >= 2 && total % 10 <= 4 ? 'удара' : 'ударов';
    current.querySelectorAll('[data-purchase-result]').forEach(function (el) { el.textContent = 'Оплачено ' + price + ' Stars. К балансу добавлено ' + pack + (pack === 1 ? ' удар' : pack === 3 ? ' удара' : ' ударов') + '. Теперь: ' + total + ' ' + unit + '.'; });
    if (current.dataset.view === 'battle-positive-ok') current.querySelectorAll('[data-battle-back]').forEach(function (el) { el.href = 'battle.html?balance=' + total + '#' + source; });
  }
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); }); variants();
  show(location.hash.slice(1) || (file === 'task-new.html' ? 'empty' : views[0].dataset.view));
})();
