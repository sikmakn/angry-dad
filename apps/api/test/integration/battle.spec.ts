import { backend, checkIn, taskPeriod, uid, user } from '../helpers/backend';
import { BattleService } from '../../src/modules/battle/battle.service';
import { TurnService } from '../../src/modules/battle/services/turn.service';
import { TurnRecoveryService } from '../../src/modules/battle/services/turn-recovery.service';
import { StrikesService } from '../../src/modules/strikes/strikes.service';
import { AiProvider, AiProviderFailure } from '../../src/modules/ai/services/ai-provider.service';
import { AiService } from '../../src/modules/ai/ai.service';

describe('Battle reservation, context and recovery', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  it('successful turn consumes one strike and replay does not call model again', async () => {
    const u = await user(h.db), strikes = h.app.get(StrikesService), battle = h.app.get(BattleService), key = uid();
    await strikes.manual(u._id, 'manual_grant', 2, 'Synthetic', uid());
    const provider = jest.spyOn(h.app.get(AiProvider), 'call');
    const a = await battle.turn(u, 'father', 'Аргумент', key);
    const b = await battle.turn(u, 'father', 'Аргумент', key);
    expect(a.repeated).toBe(false);
    expect(b).toEqual({
      result: a.result,
      repeated: true,
    });
    expect(provider).toHaveBeenCalledTimes(2);
    expect((await strikes.balance(u._id)).balance).toBe(1);
    expect(await h.db.model('StrikeOperation').findOne({
      userId: u._id,
      type: 'spend',
    }).lean()).toMatchObject({
      paidStrike: false,
      economicState: 'consumed',
    });
    await expect(battle.turn(u, 'father', 'Изменённый аргумент', key)).rejects.toMatchObject({
      status: 409,
      code: 'idempotency_key_reused',
    });
  });
  it('invalid AI output fails turn and refunds once; no fabricated messages', async () => {
    const u = await user(h.db), strikes = h.app.get(StrikesService), battle = h.app.get(BattleService), key = uid();
    await strikes.manual(u._id, 'manual_grant', 1, 'Synthetic', uid());
    jest.spyOn(h.app.get(AiProvider), 'call').mockResolvedValue({
      value: {
        hit: 11,
        logic: 5,
        originality: 5,
        corner: false,
        weakSpotHit: null,
      },
    });
    await expect(battle.turn(u, 'father', 'Аргумент', key)).rejects.toMatchObject({ status: 502 });
    const turn = (await h.db.model('Turn').findOne({ userId: u._id }).lean())!;
    await h.app.get(TurnService).failTurn(turn._id);
    expect((await strikes.balance(u._id)).balance).toBe(1);
    expect(await h.db.model('StrikeOperation').countDocuments({
      userId: u._id,
      type: 'turn_refund',
    })).toBe(1);
    expect(await h.db.model('BattleMessage').countDocuments({
      userId: u._id,
      origin: 'turn',
    })).toBe(0);
    await expect(battle.turn(u, 'father', 'Аргумент', key)).rejects.toMatchObject({ status: 502 });
  });
  it('role mismatch and zero balance prevent model calls', async () => {
    const u = await user(h.db), call = jest.spyOn(h.app.get(AiProvider), 'call');
    await expect(h.app.get(BattleService).turn(u, 'mother', 'Аргумент', uid())).rejects.toMatchObject({
      status: 409,
      code: 'role_mismatch',
    });
    await expect(h.app.get(BattleService).turn(u, 'father', 'Аргумент', uid())).rejects.toMatchObject({
      status: 409,
      code: 'insufficient_strikes',
    });
    expect(call).not.toHaveBeenCalled();
  });
  it('actor refusal after a valid judge refunds reservation and preserves dialog history', async () => {
    const u = await user(h.db), strikes = h.app.get(StrikesService), battle = h.app.get(BattleService);
    await strikes.manual(u._id, 'manual_grant', 1, 'Synthetic', uid());
    const dialog = await battle.dialog(u, 'father');
    const before = await h.db.model('BattleMessage').find({ dialogId: dialog._id }).sort({ seq: 1 }).lean();
    const call = jest.spyOn(h.app.get(AiProvider), 'call')
      .mockResolvedValueOnce({
        value: {
          hit: 10,
          logic: 10,
          originality: 10,
          corner: true,
          weakSpotHit: null,
        },
      })
      .mockRejectedValueOnce(new AiProviderFailure('refusal', { inputTokens: 10 }));
    const key = uid();
    await expect(battle.turn(u, 'father', 'Аргумент', key)).rejects.toMatchObject({ status: 502 });
    expect(call).toHaveBeenCalledTimes(2);
    expect((await strikes.balance(u._id)).balance).toBe(1);
    expect(await h.db.model('BattleMessage').find({ dialogId: dialog._id }).sort({ seq: 1 }).lean()).toEqual(before);
    expect(await h.db.model('BattleDialog').findById(dialog._id).lean()).toMatchObject({ defeat: 0 });
    await expect(battle.turn(u, 'father', 'Аргумент', key)).rejects.toMatchObject({ status: 502 });
    expect(call).toHaveBeenCalledTimes(2);
    expect(await h.db.model('StrikeOperation').countDocuments({
      userId: u._id,
      type: 'turn_refund',
    })).toBe(1);
  });
  it('quotes append to existing dialog, preserve key semantics, reject private/draft feed', async () => {
    const u = await user(h.db), other = await user(h.db), { period } = await taskPeriod(h.db, u);
    const feed = await checkIn(h.db, u, period._id), battle = h.app.get(BattleService), key = uid();
    const dialog = await battle.dialog(u, 'father');
    const quote = await battle.quote(u, 'father', feed._id, key);
    expect(quote).toMatchObject({
      text: feed.text,
      origin: 'reply_to_feed',
    });
    expect(await battle.quote(u, 'father', feed._id, key)).toEqual(quote);
    expect(await h.db.model('BattleDialog').countDocuments({ userId: u._id })).toBe(1);
    expect(await h.db.model('BattleMessage').countDocuments({ dialogId: dialog._id })).toBe(2);
    const draft = await checkIn(h.db, u, period._id, { draft: true });
    await expect(battle.quote(u, 'father', draft._id, uid())).rejects.toMatchObject({ status: 404 });
    await expect(battle.quote(other, 'father', feed._id, uid())).rejects.toMatchObject({ status: 404 });
    const second = await checkIn(h.db, u, period._id);
    await expect(battle.quote(u, 'father', second._id, key)).rejects.toMatchObject({ status: 409 });
  });
  it('next turn includes quoted feed and saved summary, excludes summarized messages and profile', async () => {
    const u = await user(h.db, {
      firstName: 'PRIVATE PROFILE',
      username: 'private_handle',
    });
    const battle = h.app.get(BattleService), dialog = await battle.dialog(u, 'father');
    const { period } = await taskPeriod(h.db, u);
    await h.db.model('BattleDialog').updateOne({ _id: dialog._id }, {
      $set: {
        summary: 'Сохранённое резюме',
        summaryUpTo: 1,
      },
    });
    const feed = await checkIn(h.db, u, period._id, { text: 'Уникальная цитата обращения' });
    await battle.quote(u, 'father', feed._id, uid());
    await h.app.get(StrikesService).manual(u._id, 'manual_grant', 1, 'Synthetic', uid());
    const call = jest.spyOn(h.app.get(AiProvider), 'call');
    await battle.turn(u, 'father', 'Ответ на цитату', uid());
    const judge = call.mock.calls.find(row => row[0] === 'judge')![1];
    const actor = call.mock.calls.find(row => row[0] === 'actor')![1];
    expect(judge.context).toEqual([{
      author: 'character',
      text: feed.text,
    }]);
    expect(actor).toMatchObject({
      summary: 'Сохранённое резюме',
      context: [{
        author: 'character',
        text: feed.text,
      }],
    });
    const input = JSON.stringify(call.mock.calls.map(row => row[1]));
    expect(input).not.toContain(u.telegramId.toString());
    expect(input).not.toContain('PRIVATE PROFILE');
    expect(input).not.toContain('private_handle');
  });
  it('summary traversal passes 100 short dialogs across different users and recovers after AI error', async () => {
    const base = `000-summary-${Date.now()}`, at = new Date();
    await h.db.model('BattleDialog').insertMany(Array.from({ length: 100 }, (_, i) => ({
      _id: `${base}-${String(i).padStart(3, '0')}`,
      userId: `${base}-user-${i}`,
      role: 'father',
      defeat: 0,
      defeatAt: at,
      defeatAtLastTurn: 0,
      brokenArmed: true,
      nextSeq: 0,
    })));
    const first = await user(h.db), second = await user(h.db);
    const tailIds = [`001-summary-${uid()}`, `002-summary-${uid()}`];
    for (const [i, owner] of [first, second].entries()) {
      await h.db.model('BattleDialog').create({
        _id: tailIds[i],
        userId: owner._id,
        role: 'father',
        defeat: 0,
        defeatAt: at,
        defeatAtLastTurn: 0,
        brokenArmed: true,
        nextSeq: 21,
      });
      await h.db.model('BattleMessage').insertMany(Array.from({ length: 21 }, (_, n) => ({
        dialogId: tailIds[i],
        userId: owner._id,
        seq: n + 1,
        author: n % 2 ? 'player' : 'character',
        origin: 'turn',
        turnId: `turn-${n}`,
        text: `Сообщение ${n}`,
      })));
    }
    const summary = jest.spyOn(h.app.get(AiService), 'summarize').mockRejectedValueOnce(new Error('one AI failure')).mockResolvedValue('Краткая история');
    const recovery = new TurnRecoveryService(h.db, h.app.get(AiService), h.app.get(TurnService));
    await recovery.recover();
    expect(summary).not.toHaveBeenCalled();
    await expect(recovery.recover()).rejects.toThrow('one AI failure');
    await recovery.recover();
    expect((await h.db.model('BattleDialog').findById(tailIds[1]).lean())?.summaryUpTo).toBe(13);
    expect(summary.mock.calls[1][2]).toBe('turn-12');
    expect(summary.mock.calls[1][0].messages).toHaveLength(13);
    await recovery.recover();
    await recovery.recover();
    await recovery.recover();
    expect((await h.db.model('BattleDialog').findById(tailIds[0]).lean())?.summaryUpTo).toBe(13);
    expect(await h.db.model('BattleMessage').countDocuments({ dialogId: tailIds[0] })).toBe(21);
  });
});
