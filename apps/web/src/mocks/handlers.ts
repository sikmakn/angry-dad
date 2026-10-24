import { delay, http, HttpResponse } from 'msw';
import type { Body, Operation, Problem, Role, Schema, Task } from '../api/contract';
import { endpoints, type ClientOperation } from '../api/operations';
import { config } from '../platform/telegram';
import { balances, dialogs, feed, gameSettings, journal, me, messages, mockScenario, packages, payments, phrases, roleCards, strikeOperations, tasks, tickets } from './fixtures';

function problem(code: Problem['type'], status: number, extra: Partial<Problem> = {}) {
  return HttpResponse.json<Problem>({ type: code, status, title: 'Mock error', ...extra }, { status });
}
const notFound = () => problem('urn:angry-dad:problem:not_found', 404);
const conflict = (status: Problem['periodStatus'] = 'failed') => problem('urn:angry-dad:problem:period_not_active', 409, { periodStatus: status });
const now = () => new Date().toISOString();
const turns = new Map<string, Schema<'TurnResponse'>>();
const turnTexts = new Map<string, string>();
const failedTurns = new Set<string>();
const quotes = new Map<string, Schema<'BattleMessageResponse'>>();
const rewardedSteps = new Map<Role, number>();
const archivedPeriods = new Map<string, Schema<'PeriodResponse'>[]>();

function list<T>(items: T[], url: URL) {
  const start = Number(url.searchParams.get('cursor') ?? 0);
  const limit = Number(url.searchParams.get('limit') ?? 50);
  return { items: items.slice(start, start + limit), nextCursor: start + limit < items.length ? String(start + limit) : null };
}

function spendStrikes(amount: number) {
  let remaining = amount;
  for (const lot of balances.lots) {
    const spent = Math.min(lot.remaining, remaining);
    lot.remaining -= spent;
    remaining -= spent;
  }
  balances.balance -= amount;
  // The fixture's purchase lot belongs to pay_01; any spend makes it nonrefundable.
  if (amount > 0 && payments[0]) {
    payments[0].refundable = false;
  }
}

function finish(task: Task, done: boolean, check = false) {
  const period = task.currentPeriod!;
  const expected = { micro: 1, medium: 3, large: 5 }[task.size];
  const delta = done ? Math.max(0, Math.min(expected, 94 - me.respect)) : -Math.min(1, me.respect);
  me.respect += delta;
  period.status = done ? 'done' : 'failed';
  period.closedAt = now();
  period.closedBy = done ? check ? 'check_in' : 'done_button' : 'give_up';
  period.respectDelta = delta;
  if (task.kind === 'one_time') {
    task.status = 'closed';
  } else {
    task.nextPeriodStartsAt = new Date(Date.now() + 86400000).toISOString();
  }
  const reply = done ? 'Вовремя. Надо же. Не привык я такое говорить, поэтому скажу один раз: нормально.' : 'Сам сдался, сам и расскажешь, почему.';
  const message: Schema<'FeedMessageResponse'> = { id: crypto.randomUUID(), text: reply, category: done ? 'on_success' : 'on_fail', rateable: !done, periodId: period.id, taskTitle: task.title, sentAt: now() };
  feed.unshift(message);
  if (!done) {
    period.failMessage = message;
  }
  me.closedCount += Number(done);
  return { task, respectDelta: delta, respect: me.respect, reply } satisfies Schema<'PeriodActionResponse'>;
}

async function resolve(operation: ClientOperation, request: Request, params: Record<string, string | readonly string[] | undefined>) {
  const url = new URL(request.url);
  const body = async <K extends Operation>() => await request.json() as Body<K>;
  const path = (key: string) => String(params[key] ?? '');
  const role = path('role') as Role;
  if (mockScenario === 'slow') {
    await delay(2500);
  } else {
    await delay(180);
  }
  // Explicit URL scenarios apply at the HTTP boundary; never fall through to a real API.
  if (mockScenario === 'error' && operation !== 'getMe') {
    return HttpResponse.error();
  }
  if (operation.startsWith('getOwner') || operation.includes('Owner')) {
    if (!me.isOwner) {
      return problem('urn:angry-dad:problem:owner_only', 403);
    }
  }
  if (operation !== 'getMe' && operation !== 'completeOnboarding' && operation !== 'deleteMe' && me.onboarding === 'guest') {
    return problem('urn:angry-dad:problem:onboarding_required', 403);
  }
  if (operation.includes('Battle') && role !== me.role) {
    return problem('urn:angry-dad:problem:role_mismatch', 409);
  }
  // Optional operation-specific errors keep each status/code pair inside its contract.
  const failure = new URLSearchParams(window.location.search).get('mockFailure');
  if (failure === 'daily-limit' && (operation === 'createTask' || operation === 'updateTask')) {
    return problem('urn:angry-dad:problem:daily_limit_reached', 429);
  }
  if (failure === 'ai' && (operation === 'createTask' || operation === 'updateTask' || operation === 'createOwnerParaphrases')) {
    return problem('urn:angry-dad:problem:ai_unavailable', 503);
  }
  if (failure === 'extension' && operation === 'extendPeriod') {
    return problem('urn:angry-dad:problem:extension_denied', 409, { reply: 'Один раз в сутки. Хватит.' });
  }
  switch (operation) {
    case 'getMe': return HttpResponse.json(me);
    case 'completeOnboarding': {
      if (me.onboarding === 'done') {
        return problem('urn:angry-dad:problem:already_onboarded', 409);
      }
      Object.assign(me, await body<'completeOnboarding'>(), { onboarding: 'done', respect: 12 });
      return HttpResponse.json<Schema<'OnboardingResponse'>>({ user: me, replies: ['Соболезнуем Вам. Крепитесь…', `Опять ничего ${me.gender === 'female' ? 'сама' : 'сам'} не можешь? Ну, что тебе надо сделать?`, 'Мечты сюда не пиши. Витать в облаках — не работа. Что нужно сделать, чётко?'] });
    }
    case 'updateMe': {
      Object.assign(me, await body<'updateMe'>());
      return HttpResponse.json(me);
    }
    case 'deleteMe': {
      tasks.splice(0);
      feed.splice(0);
      balances.balance = 0;
      balances.lots.splice(0);
      messages.father.splice(0);
      messages.mother.splice(0);
      turns.clear();
      turnTexts.clear();
      failedTurns.clear();
      quotes.clear();
      archivedPeriods.clear();
      payments.forEach((payment) => {
        payment.refundable = false;
      });
      Object.assign(me, { onboarding: 'guest', respect: 12, returning: true, closedCount: 0 });
      return new HttpResponse(null, { status: 204 });
    }
    case 'setLeaderboardParticipation': {
      const data = await body<'setLeaderboardParticipation'>();
      me.inLeaderboard = data.inLeaderboard;
      return HttpResponse.json(data);
    }
    case 'getLeaderboard': return HttpResponse.json<Schema<'LeaderboardResponse'>>({ items: me.inLeaderboard && me.closedCount > 0 ? [{ rank: 1, username: me.username, firstName: me.firstName, closedCount: me.closedCount }] : [], me: { rank: me.inLeaderboard && me.closedCount > 0 ? 1 : null, closedCount: me.closedCount, inLeaderboard: me.inLeaderboard } });
    case 'listTasks': {
      let items = tasks.filter(task => (!url.searchParams.get('status') || task.status === url.searchParams.get('status')) && (!url.searchParams.get('kind') || task.kind === url.searchParams.get('kind')));
      if (url.searchParams.get('sort') === 'deadline') {
        items = items.toSorted((a, b) => Date.parse(a.currentPeriod?.deadline ?? '9999-01-01') - Date.parse(b.currentPeriod?.deadline ?? '9999-01-01'));
      }
      return HttpResponse.json(list(items, url));
    }
    case 'createTask': {
      const data = await body<'createTask'>();
      if (!data.title.trim() || data.title.trim().length > 120 || (data.kind === 'one_time' ? !data.deadline || !!data.recurrence || !!data.anchorTime : !data.recurrence || !!data.deadline)) {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      if (data.deadline && (!Number.isFinite(Date.parse(data.deadline)) || Date.parse(data.deadline) < Date.now() + 15 * 60000 || Date.parse(data.deadline) > Date.now() + 365 * 86400000)) {
        return problem('urn:angry-dad:problem:deadline_out_of_range', 400);
      }
      if (data.title.toLowerCase().includes('стать лучше')) {
        return problem('urn:angry-dad:problem:task_vague', 400, { reply: 'Это что за задача? Конкретно.' });
      }
      const task: Task = { ...data, title: data.title.trim(), id: crypto.randomUUID(), status: 'active', size: 'medium', createdAt: now(), currentPeriod: { id: crypto.randomUUID(), startsAt: now(), moodFrom: now(), deadline: data.deadline ?? new Date(Date.now() + 6 * 3600000).toISOString(), status: 'active', retryUsed: false } };
      tasks.unshift(task);
      return HttpResponse.json<Schema<'TaskActionResponse'>>({ task, reply: 'Записал. Посмотрим.' }, { status: 201 });
    }
    case 'getTask': return tasks.find(task => task.id === path('taskId')) ? HttpResponse.json(tasks.find(task => task.id === path('taskId'))) : notFound();
    case 'updateTask': {
      const task = tasks.find(task => task.id === path('taskId'));
      if (!task) {
        return notFound();
      }
      if (task.status !== 'active') {
        return conflict(task.status === 'stopped' ? 'stopped' : task.currentPeriod?.status === 'done' ? 'done' : 'failed');
      }
      const data = await body<'updateTask'>();
      if (data.status && task.kind !== 'recurring') {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      if (data.title?.includes('стать лучше')) {
        return problem('urn:angry-dad:problem:task_vague', 400, { reply: 'Это что за задача? Конкретно.' });
      }
      Object.assign(task, data);
      if (data.status) {
        delete task.nextPeriodStartsAt;
      }
      return HttpResponse.json({ task, reply: data.status ? 'Бросаешь всё, что начинаешь.' : null });
    }
    case 'deleteTask': {
      const index = tasks.findIndex(task => task.id === path('taskId'));
      if (index < 0) {
        return notFound();
      }
      const [removed] = tasks.splice(index, 1);
      for (let n = feed.length - 1; n >= 0; n--) {
        if (feed[n].periodId === removed.currentPeriod?.id) {
          feed.splice(n, 1);
        }
      }
      return HttpResponse.json({ reply: 'Бросаешь всё, что начинаешь.' });
    }
    case 'listTaskPeriods': {
      const task = tasks.find(task => task.id === path('taskId'));
      return task ? HttpResponse.json(list([...(task.currentPeriod ? [task.currentPeriod] : []), ...(archivedPeriods.get(task.id) ?? [])], url)) : notFound();
    }
    case 'completePeriod':
    case 'surrenderPeriod':
    case 'extendPeriod':
    case 'retryPeriod': {
      const task = tasks.find(task => task.currentPeriod?.id === path('periodId'));
      if (!task?.currentPeriod) {
        return notFound();
      }
      const period = task.currentPeriod;
      if (operation === 'retryPeriod') {
        if (period.status !== 'failed' || period.retryUsed) {
          return problem('urn:angry-dad:problem:retry_unavailable', 409);
        }
        Object.assign(period, { status: 'active', retryUsed: true, deadline: new Date(Date.now() + 3600000).toISOString() });
        delete period.closedAt;
        delete period.closedBy;
        delete period.respectDelta;
        delete period.failMessage;
        delete task.nextPeriodStartsAt;
        task.status = 'active';
        return HttpResponse.json({ task, respect: me.respect, respectDelta: 0, reply: 'Час. Ровно час. Не два и не «до завтра».' });
      }
      if (period.status !== 'active' || task.status !== 'active') {
        return conflict(task.status === 'stopped' ? 'stopped' : period.status === 'done' ? 'done' : 'failed');
      }
      if (operation === 'extendPeriod') {
        const data = await request.json().catch(() => ({})) as Body<'extendPeriod'>;
        const previous = Date.parse(period.deadline);
        const next = data.deadline ? Date.parse(data.deadline) : previous + 3600000;
        if (!Number.isFinite(next) || next <= previous || next > Date.now() + 365 * 86400000) {
          return problem('urn:angry-dad:problem:deadline_out_of_range', 400);
        }
        period.deadline = new Date(next).toISOString();
        const reply = next - previous <= 3600000 ? 'Час добавили. Задача от этого короче не стала.' : next - previous <= 86400000 ? 'Удобно у тебя работа движется — вместе с дедлайном.' : 'Ты задачу выполняешь или ждёшь, пока её отменят?';
        return HttpResponse.json({ task, respect: me.respect, respectDelta: 0, reply });
      }
      return HttpResponse.json(finish(task, operation === 'completePeriod'));
    }
    case 'listFeed': {
      const items = feed.map(item => ({ ...item, needsAnswer: item.category === 'on_check_in' && !item.checkIn?.answer && tasks.some(task => task.status === 'active' && !!task.currentPeriod && task.currentPeriod.id === item.periodId && task.currentPeriod.status === 'active' && Date.parse(task.currentPeriod.deadline) > Date.now()) }));
      const unread = items.filter(item => item.rateable && !item.readAt);
      const pending = items.filter(item => item.needsAnswer);
      return HttpResponse.json({ ...list(items.filter(item => (!url.searchParams.get('periodId') || item.periodId === url.searchParams.get('periodId')) && (!url.searchParams.get('category') || item.category === url.searchParams.get('category'))), url), unreadCount: unread.length, unansweredCount: pending.length, activeCount: unread.length + pending.filter(item => !!item.readAt).length });
    }
    case 'markFeedMessageRead': {
      const item = feed.find(message => message.id === path('feedMessageId'));
      if (!item) {
        return notFound();
      }
      item.readAt ??= now();
      return HttpResponse.json(item);
    }
    case 'rateFeedMessage': {
      const item = feed.find(message => message.id === path('feedMessageId'));
      if (!item) {
        return notFound();
      }
      const data = await body<'rateFeedMessage'>();
      if (!item.rateable || ![0, 1, 2].includes(data.score)) {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      item.rating = data.score;
      return HttpResponse.json(item);
    }
    case 'answerCheckIn': {
      const item = feed.find(message => message.id === path('feedMessageId'));
      const task = tasks.find(task => task.currentPeriod?.id === item?.periodId);
      if (!item || !task || !item.checkIn) {
        return notFound();
      }
      if (task.currentPeriod?.status !== 'active' || task.status !== 'active') {
        return conflict(task.status === 'stopped' ? 'stopped' : task.currentPeriod?.status === 'done' ? 'done' : 'failed');
      }
      const data = await body<'answerCheckIn'>();
      item.checkIn = { ...item.checkIn, answer: data.answer, answeredAt: now() };
      item.readAt ??= now();
      return HttpResponse.json(data.answer === 'done' ? finish(task, true, true) : { task, respect: me.respect, respectDelta: 0, reply: 'Посмотрим, что будет через час.' });
    }
    case 'getBattleDialog': return role === me.role ? HttpResponse.json(dialogs[role]) : problem('urn:angry-dad:problem:role_mismatch', 409);
    case 'listBattleMessages': return HttpResponse.json(list(messages[role].toReversed(), url));
    case 'createBattleQuote': {
      const key = request.headers.get('Idempotency-Key');
      if (key && quotes.has(key)) {
        return HttpResponse.json(quotes.get(key), { status: 201 });
      }
      const data = await body<'createBattleQuote'>();
      const item = feed.find(message => message.id === data.feedMessageId);
      if (!item) {
        return notFound();
      }
      const message: Schema<'BattleMessageResponse'> = { seq: messages[role].length + 1, author: 'character', text: item.text, taskTitle: item.taskTitle, origin: 'reply_to_feed' };
      messages[role].push(message);
      if (key) {
        quotes.set(key, message);
      }
      return HttpResponse.json(message, { status: 201 });
    }
    case 'createBattleMessage': {
      const key = request.headers.get('Idempotency-Key') ?? '';
      const data = await body<'createBattleMessage'>();
      const scopedKey = `${role}:${key}`;
      if (!key || data.text.replace(/\s/g, '').length < 2 || data.text.length > 300) {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      if (turnTexts.has(scopedKey) && turnTexts.get(scopedKey) !== data.text) {
        return problem('urn:angry-dad:problem:idempotency_key_reused', 409);
      }
      if (turns.has(scopedKey)) {
        return HttpResponse.json(turns.get(scopedKey));
      }
      if (failedTurns.has(scopedKey)) {
        return problem('urn:angry-dad:problem:turn_failed', 502);
      }
      if (dialogs[role].turnInProgress) {
        return problem('urn:angry-dad:problem:turn_in_progress', 409);
      }
      if (!balances.balance) {
        return problem('urn:angry-dad:problem:insufficient_strikes', 409);
      }
      turnTexts.set(scopedKey, data.text);
      if (data.text === 'ошибка') {
        failedTurns.add(scopedKey);
        return problem('urn:angry-dad:problem:turn_failed', 502);
      }
      const dialog = dialogs[role];
      const before = dialog.defeat;
      dialog.defeat = Math.min(100, before + 21);
      dialog.mode = dialog.defeat < 40 ? 'aggression' : dialog.defeat <= 70 ? 'defense' : dialog.defeat <= 90 ? 'confusion' : 'softening';
      const broken = before < 100 && dialog.defeat === 100;
      const paidBefore = rewardedSteps.get(role) ?? Math.floor(before / 20);
      const paidAfter = Math.max(paidBefore, Math.floor(dialog.defeat / 20));
      rewardedSteps.set(role, paidAfter);
      const milestoneRespect = Math.min(Math.max(94, me.respect), me.respect + paidAfter - paidBefore);
      const nextRespect = Math.min(100, milestoneRespect + (broken ? 12 : 0));
      const delta = nextRespect - me.respect;
      me.respect = nextRespect;
      spendStrikes(1);
      const added: Schema<'BattleMessageResponse'>[] = [{ seq: messages[role].length + 1, author: 'player', text: data.text, origin: 'turn' }, { seq: messages[role].length + 2, author: 'character', text: broken ? 'Ну... Я просто хотел как лучше. Вот и всё, что я хотел сказать.' : 'Погоди. Я не кричал. Я повышал голос. Это другое. Ты к чему вообще клонишь?', origin: broken ? 'break' : 'turn' }];
      messages[role].push(...added);
      strikeOperations.unshift({ type: 'spend', amount: 1, at: now() });
      const response: Schema<'TurnResponse'> = { damage: dialog.defeat - before, defeatBefore: before, defeatAfter: dialog.defeat, mode: dialog.mode, respect: me.respect, respectDelta: delta, messages: added, strikesBalance: balances.balance };
      turns.set(scopedKey, response);
      return HttpResponse.json(response, { status: 201 });
    }
    case 'getMyStrikes':
    case 'getOwnerUserStrikes': return HttpResponse.json(balances);
    case 'listMyStrikeOperations':
    case 'listOwnerUserStrikeOperations': return HttpResponse.json(list(strikeOperations, url));
    case 'listPackages': return HttpResponse.json({ items: packages.filter(pack => pack.active).toSorted((a, b) => a.order - b.order).map(({ id, strikes, priceStars }) => ({ id, strikes, priceStars })) });
    case 'createInvoice': return problem('urn:angry-dad:problem:payment_gateway_unavailable', 503);
    case 'createShare': return problem('urn:angry-dad:problem:share_failed', 503);
    case 'getOwnerUser': return path('telegramId') === '123456789' ? HttpResponse.json({ telegramId: 123456789, username: 'demo', firstName: 'Иван' }) : notFound();
    case 'createOwnerStrikeOperation': {
      const data = await body<'createOwnerStrikeOperation'>();
      if (!data.reason.trim()) {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      if (data.type === 'manual_revoke' && data.amount > balances.balance) {
        return problem('urn:angry-dad:problem:revoke_exceeds_balance', 409);
      }
      const delta = data.type === 'manual_revoke' ? -data.amount : data.amount;
      if (data.type === 'manual_revoke') {
        spendStrikes(data.amount);
      } else {
        balances.balance += data.amount;
        balances.lots.push({ source: 'manual', total: data.amount, remaining: data.amount, createdAt: now() });
      }
      const created: Schema<'StrikeOperationResponse'> = { type: data.type, amount: data.amount, reason: data.reason, at: now() };
      strikeOperations.unshift(created);
      journal.unshift({ action: data.type === 'manual_grant' ? 'strikes_grant' : 'strikes_revoke', targetTelegramId: Number(path('telegramId')), details: { amount: delta, reason: data.reason }, at: now() });
      return HttpResponse.json(created, { status: 201 });
    }
    case 'listOwnerPhrases': {
      const items = phrases.filter(item => (!url.searchParams.get('status') || item.status === url.searchParams.get('status')) && (!url.searchParams.get('role') || item.role === url.searchParams.get('role')) && (!url.searchParams.get('category') || item.category === url.searchParams.get('category')) && (!url.searchParams.has('belowThreshold') || item.belowThreshold === (url.searchParams.get('belowThreshold') === 'true')));
      items.sort(url.searchParams.get('sort') === 'avg' ? (a, b) => a.scoreSum / Math.max(a.votes, 1) - b.scoreSum / Math.max(b.votes, 1) : (a, b) => b.shows - a.shows);
      return HttpResponse.json(list(items, url));
    }
    case 'createOwnerPhrase': {
      const data = await body<'createOwnerPhrase'>();
      const phrase: Schema<'PhraseResponse'> = { ...data, id: crypto.randomUUID(), status: 'enabled', shows: 0, votes: 0, scoreSum: 0, belowThreshold: false };
      phrases.unshift(phrase);
      journal.unshift({ action: 'phrase_add', targetId: phrase.id, at: now() });
      return HttpResponse.json(phrase, { status: 201 });
    }
    case 'updateOwnerPhrase': {
      const phrase = phrases.find(item => item.id === path('phraseId'));
      if (!phrase) {
        return notFound();
      }
      const data = await body<'updateOwnerPhrase'>();
      if (data.status === 'disabled' && phrase.status === 'enabled' && phrase.defeatLevel === 'any' && phrase.combo === 'any' && !phrases.some(item => item.id !== phrase.id && item.status === 'enabled' && item.role === phrase.role && item.category === phrase.category && item.level === phrase.level && item.defeatLevel === 'any' && item.combo === 'any')) {
        return problem('urn:angry-dad:problem:last_enabled_phrase', 409);
      }
      phrase.status = data.status;
      journal.unshift({ action: 'phrase_toggle', targetId: phrase.id, at: now() });
      return HttpResponse.json(phrase);
    }
    case 'createOwnerParaphrases': {
      const original = phrases.find(item => item.id === path('phraseId'));
      if (!original) {
        return notFound();
      }
      const data = await body<'createOwnerParaphrases'>();
      const items = Array.from({ length: data.count ?? 3 }, () => ({ ...original, id: crypto.randomUUID(), source: 'paraphrase' as const, status: 'pending_review' as const, shows: 0, votes: 0, scoreSum: 0, belowThreshold: false, template: 'Сергей из пятого подъезда управлялся(лась) с таким за час. А ты снова откладываешь «{task}».' }));
      phrases.unshift(...items);
      return HttpResponse.json({ items }, { status: 201 });
    }
    case 'getOwnerPhraseCoverage': return HttpResponse.json<Schema<'PhraseCoverageResponse'>>({ items: [{ role: 'father', category: 'on_check_in', level: 1, defeatLevel: 'any', combo: 'any', enabledCount: phrases.filter(item => item.status === 'enabled').length, required: 12 }] });
    case 'getOwnerRoleCard': return HttpResponse.json(roleCards[role]);
    case 'replaceOwnerRoleCard': {
      Object.assign(roleCards[role], await body<'replaceOwnerRoleCard'>());
      journal.unshift({ action: 'role_card_edit', targetId: role, at: now() });
      return HttpResponse.json(roleCards[role]);
    }
    case 'listOwnerPackages': return HttpResponse.json({ items: packages });
    case 'createOwnerPackage': {
      const data = await body<'createOwnerPackage'>();
      const pack = { ...data, id: crypto.randomUUID() };
      packages.push(pack);
      return HttpResponse.json(pack, { status: 201 });
    }
    case 'replaceOwnerPackage': {
      const pack = packages.find(item => item.id === path('packageId'));
      if (!pack) {
        return notFound();
      }
      Object.assign(pack, await body<'replaceOwnerPackage'>());
      journal.unshift({ action: 'package_edit', targetId: pack.id, at: now() });
      return HttpResponse.json(pack);
    }
    case 'listOwnerPayments': return HttpResponse.json(list(payments.filter(item => (!url.searchParams.get('telegramId') || item.telegramId === Number(url.searchParams.get('telegramId'))) && (!url.searchParams.get('status') || item.status === url.searchParams.get('status'))), url));
    case 'refundOwnerPayment': {
      const payment = payments.find(item => item.id === path('paymentId'));
      if (!payment?.refundable) {
        return problem('urn:angry-dad:problem:refund_not_allowed', 409);
      }
      const data = await body<'refundOwnerPayment'>();
      if (!data.reason.trim()) {
        return problem('urn:angry-dad:problem:validation_failed', 400);
      }
      spendStrikes(payment.packageSnapshot.strikes);
      payment.status = 'refunded';
      payment.refundable = false;
      strikeOperations.unshift({ type: 'stars_refund', amount: payment.packageSnapshot.strikes, reason: data.reason, at: now() });
      journal.unshift({ action: 'stars_refund', targetId: payment.id, targetTelegramId: payment.telegramId, details: { reason: data.reason }, at: now() });
      return HttpResponse.json(payment);
    }
    case 'listOwnerSupportTickets': return HttpResponse.json(list(tickets.filter(item => !url.searchParams.get('status') || item.status === url.searchParams.get('status')), url));
    case 'updateOwnerSupportTicket': {
      const ticket = tickets.find(item => item.id === path('ticketId'));
      if (!ticket) {
        return notFound();
      }
      Object.assign(ticket, await body<'updateOwnerSupportTicket'>());
      return HttpResponse.json(ticket);
    }
    case 'getOwnerMetrics': return HttpResponse.json<Schema<'MetricsResponse'>>({ from: url.searchParams.get('from')!, to: url.searchParams.get('to')!, day7Retention: null, closedShare: null, checkInAnswerRate: null, firstPurchaseConversion: null, turnCostToStrikeRevenue: null, botBlockedShare: null, avgPhraseScore: null, sharesPer100Active: null, medianStartToFirstTaskSeconds: null });
    case 'listOwnerJournal': return HttpResponse.json(list(journal.filter(item => !url.searchParams.get('action') || item.action === url.searchParams.get('action')), url));
    case 'getOwnerGameSettings': return HttpResponse.json(gameSettings);
    case 'replaceOwnerGameSettings': {
      Object.assign(gameSettings, await body<'replaceOwnerGameSettings'>());
      journal.unshift({ action: 'settings_edit', at: now() });
      return HttpResponse.json(gameSettings);
    }
  }
}

const methods = { GET: http.get, POST: http.post, PUT: http.put, PATCH: http.patch, DELETE: http.delete };
// A distinct handler for each Mini App operation, using the same contract route registry.
export const handlers = (Object.keys(endpoints) as ClientOperation[]).map((operation) => {
  const [method, template] = endpoints[operation];
  const route = template.replace(/\{(\w+)\}/g, ':$1');
  return methods[method](`${config.apiBase}${route}`, ({ request, params }) => resolve(operation, request, params));
});
// Mock mode never forwards an accidentally missing API route to a running backend.
handlers.push(http.all(`${config.apiBase}/*`, notFound));
