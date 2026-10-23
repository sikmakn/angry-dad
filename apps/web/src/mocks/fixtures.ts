import type { FeedMessage, Me, Role, Schema, Task } from '../api/contract';

const now = new Date().toISOString();
const params = new URLSearchParams(window.location.search);
const scenario = params.get('mockState') ?? params.get('mock') ?? 'normal';
export const mockScenario = scenario;
export const me: Me = { id: 'u_demo', isOwner: params.get('mock') === 'owner', username: 'demo', firstName: 'Иван', onboarding: scenario === 'guest' ? 'guest' : 'done', role: scenario === 'mother' ? 'mother' : 'father', gender: scenario === 'mother' ? 'female' : 'male', timeZone: 'Europe/Minsk', quietHours: { start: 1380, end: 480 }, respect: scenario === 'cap' ? 98 : 14, inLeaderboard: scenario !== 'empty', closedCount: scenario === 'empty' ? 0 : 7 };
export const tasks: Task[] = scenario === 'empty'
  ? []
  : [
      { id: 't_01', title: 'написать отчёт по продажам', kind: 'one_time', size: 'medium', status: 'active', createdAt: now, currentPeriod: { id: 'p_01', startsAt: now, moodFrom: new Date(Date.now() - 3 * 3600000).toISOString(), deadline: new Date(Date.now() + 3600000).toISOString(), status: 'active', retryUsed: false } },
      { id: 't_02', title: 'повторять английский каждый день', kind: 'recurring', size: 'micro', status: 'active', recurrence: { type: 'daily' }, anchorTime: '20:00', createdAt: now, currentPeriod: { id: 'p_02', startsAt: now, moodFrom: now, deadline: new Date(Date.now() + 6 * 3600000).toISOString(), anchorAt: new Date(Date.now() + 4 * 3600000).toISOString(), status: 'active', retryUsed: false } },
    ];
export const feed: FeedMessage[] = tasks.length ? [{ id: 'f_01', category: 'on_check_in', text: 'Покажи, что сделано. Две минуты.', periodId: 'p_01', taskTitle: tasks[0].title, rateable: true, checkIn: {}, sentAt: now }] : [];
if (scenario === 'missed') {
  feed[0].checkIn = { missedAt: now };
}
if (scenario === 'failed' || scenario === 'closed' || scenario === 'waiting') {
  const task = tasks[scenario === 'waiting' ? 1 : 0];
  const period = task.currentPeriod!;
  const failed = scenario === 'failed';
  Object.assign(period, { status: failed ? 'failed' : 'done', closedAt: now, closedBy: failed ? 'deadline' : 'done_button', respectDelta: failed ? -1 : 3 });
  task.status = scenario === 'waiting' ? 'active' : 'closed';
  if (scenario === 'waiting') {
    task.nextPeriodStartsAt = new Date(Date.now() + 86400000).toISOString();
  }
  if (failed) {
    const message: FeedMessage = { id: 'f_fail', category: 'on_fail', text: 'Опять не сделал. Я не удивлён.', periodId: period.id, taskTitle: task.title, rateable: true, sentAt: now };
    period.failMessage = message;
    feed.unshift(message);
  }
}
export const balances: Schema<'StrikeBalanceResponse'> = { balance: scenario === 'zero' ? 0 : 3, lots: [{ source: 'purchase', total: 3, remaining: scenario === 'zero' ? 0 : 3, createdAt: now }] };
export const strikeOperations: Schema<'StrikeOperationResponse'>[] = scenario === 'empty' ? [] : [{ type: 'purchase', amount: 3, at: now }];
export const packages: Schema<'OwnerPackageResponse'>[] = [{ id: 'pk_1', strikes: 1, priceStars: 15, active: true, order: 1 }, { id: 'pk_3', strikes: 3, priceStars: 39, active: true, order: 2 }, { id: 'pk_5', strikes: 5, priceStars: 60, active: true, order: 3 }];
export const dialogs: Record<Role, Schema<'BattleDialogResponse'>> = {
  father: { role: 'father', defeat: scenario === 'break' ? 94 : 0, defeatAt: now, mode: scenario === 'break' ? 'softening' : 'aggression', turnInProgress: scenario === 'pending' },
  mother: { role: 'mother', defeat: 0, defeatAt: now, mode: 'aggression', turnInProgress: false },
};
export const messages: Record<Role, Schema<'BattleMessageResponse'>[]> = {
  father: [{ seq: 1, author: 'character', text: 'Ну что, пришёл разговаривать? Я слушаю. Недолго.', origin: 'battle_start' }],
  mother: [{ seq: 1, author: 'character', text: 'Двадцать минут бабушке, а матери «некогда». Ладно, я не обижаюсь. Я привыкла.', origin: 'battle_start' }],
};
export const phrases: Schema<'PhraseResponse'>[] = [{ id: 'ph_01', role: 'father', category: 'on_check_in', level: 1, defeatLevel: 'any', combo: 'any', template: 'Покажи, что сделано. Две минуты.', source: 'owner', status: 'enabled', shows: 120, votes: 40, scoreSum: 52, belowThreshold: false }];
export const roleCards: Record<Role, Schema<'RoleCardResponse'>> = {
  father: { role: 'father', character: 'Строгий, ворчливый, всё знает лучше', weakSpots: ['unfinished_things', 'fairness', 'fear', 'promises', 'control'].map(key => ({ key, description: 'Ненавидит, когда не доводят до конца' })) },
  mother: { role: 'mother', character: 'Давит виной', weakSpots: ['unfinished_things', 'fairness', 'fear', 'promises', 'control'].map(key => ({ key, description: 'Больное место персонажа' })) },
};
export const payments: Schema<'PaymentResponse'>[] = scenario === 'empty' ? [] : [{ id: 'pay_01', telegramId: 123456789, refundable: true, status: 'credited', packageSnapshot: { strikes: 3, priceStars: 39 }, paidAt: now, creditedAt: now }];
export const tickets: Schema<'SupportTicketResponse'>[] = scenario === 'empty' ? [] : [{ id: 'st_01', telegramId: 123456789, text: 'Оплатил, ударов нет', status: 'open', at: now }];
export const journal: Schema<'OwnerJournalEntry'>[] = scenario === 'empty' ? [] : [{ action: 'strikes_grant', targetTelegramId: 123456789, details: { amount: 2, reason: 'Возврат по жалобе' }, at: now }];
export const gameSettings: Schema<'GameSettingsResponse'> = { battleCoefficients: { base: 1, damage: 1, weakSpot: 1.5, crit: 1.2 }, aiDailyLimit: 50, otherNames: [], banditParams: { trialShows: 50, disableAvg: 0.4, disableVotes: 100 } };
