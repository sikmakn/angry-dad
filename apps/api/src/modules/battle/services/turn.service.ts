import { BattleError } from '../battle.errors';
import { messageFields } from '../helpers/message-fields';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './../../../database/database.service';
import type { User } from './../../../database/schemas/user.schema';
import type { BattleMessage } from './../../../database/schemas/battle-message.schema';
import { ApiError } from './../../../common/errors/api-error';
import { present } from './../../../common/utils/presentation';
import { AiService } from './../../ai/ai.service';
import { StrikesService } from './../../strikes/strikes.service';
import { RespectService } from './../../respect/respect.service';
import { PhrasesService } from './../../phrases/phrases.service';
import { AnalyticsService } from './../../analytics/analytics.service';
import { battleMode, battleDamage } from './../helpers/damage';
import type { TurnResponseView } from './../battle.types';
import { BattleStoreService } from './battle-store.service';
@Injectable()
export class TurnService {
  constructor(private readonly db: DatabaseService, private readonly ai: AiService, private readonly strikes: StrikesService, private readonly respect: RespectService, private readonly phrases: PhrasesService, private readonly analytics: AnalyticsService, private readonly store: BattleStoreService) { }
  async turn(user: User, role: 'father' | 'mother', text: string, key: string): Promise<{
    result: TurnResponseView;
    repeated: boolean;
  }> {
    const old = await this.db.model('Turn').findOne({
      userId: user._id,
      clientTurnId: key,
    }).lean();
    if (old) {
      const previousDialog = await this.db.model('BattleDialog').findById(old.dialogId).lean();
      if (old.playerText !== text || previousDialog?.role !== role) {
        throw new BattleError(409, 'idempotency_key_reused');
      }
      if (old.status === 'failed') {
        throw new BattleError(502, 'turn_failed');
      }
      if (old.status !== 'done') {
        throw new BattleError(409, 'turn_in_progress');
      }
      return {
        result: old.result as TurnResponseView,
        repeated: true,
      };
    }
    const dialog = await this.store.dialog(user, role);
    const turnId = randomUUID();
    await this.db.transaction(async (session) => {
      const locked = await this.db.model('BattleDialog').findOneAndUpdate({
        _id: dialog._id,
        activeTurnId: { $exists: false },
      }, { $set: { activeTurnId: turnId } }, { session }).lean();
      if (!locked) {
        throw new BattleError(409, 'turn_in_progress');
      }
      const exists = await this.db.model('User').findOne({
        _id: user._id,
        deleting: { $ne: true },
      }).session(session).lean();
      if (!exists) {
        throw ApiError.notFound();
      }
      await this.strikes.reserve(user._id, turnId, session);
      await this.db.model('Turn').create([{
        _id: turnId,
        clientTurnId: key,
        dialogId: dialog._id,
        userId: user._id,
        status: 'reserved',
        playerText: text,
        startedAt: new Date(),
      }], { session });
    });
    try {
      const expiresAt = Date.now() + 30000;
      const card = await this.store.roleCard(role);
      const messages = await this.db.model('BattleMessage').find({
        dialogId: dialog._id,
        seq: { $gt: dialog.summaryUpTo ?? 0 },
      }).sort({ seq: 1 }).lean();
      const context = messages.map(row => ({
        author: row.author,
        text: row.text,
      }));
      const judge = await this.ai.judge({
        text,
        card,
        context: context.slice(-4),
      }, user._id, turnId, card.weakSpots.map(w => w.key), expiresAt);
      await this.db.model('Turn').updateOne({
        _id: turnId,
        status: 'reserved',
      }, {
        $set: {
          status: 'judged',
          judge,
        },
      });
      const settings = await this.analytics.settings();
      const calculation = battleDamage(judge, settings.battleCoefficients);
      const defeatAfter = Math.min(100, dialog.defeat + calculation.damage);
      const mode = battleMode(defeatAfter);
      const actor = await this.ai.act({
        text,
        card,
        role,
        gender: user.gender,
        mode,
        defeat: defeatAfter,
        defeatLevel: defeatAfter < 20 ? 1 : defeatAfter < 50 ? 2 : defeatAfter < 80 ? 3 : 4,
        admitPart: judge.corner && judge.logic >= 7,
        recovery: dialog.defeatAtLastTurn - dialog.defeat >= 25,
        summary: dialog.summary,
        context,
      }, user._id, turnId, expiresAt);
      if (Date.now() > expiresAt) {
        throw new Error('Turn timeout');
      }
      const result = await this.db.transaction(async (session) => {
        const current = await this.db.model('Turn').findOne({
          _id: turnId,
          status: 'judged',
        }).session(session).lean();
        const exists = await this.db.model('User').findOne({
          _id: user._id,
          deleting: { $ne: true },
        }).session(session).lean();
        if (!current || !exists) {
          throw new Error('Turn cancelled');
        }
        // Milestones are paid once per dialog, even after authority recovers.
        // Existing dialogs start from their saved progress without retroactive rewards.
        const rewardedBefore = dialog.rewardedSteps ?? Math.floor(Math.max(dialog.defeat, dialog.defeatAtLastTurn) / 20);
        const rewardedAfter = Math.max(rewardedBefore, Math.floor(defeatAfter / 20));
        const hit = await this.respect.apply(user._id, 'battle_hit', `${turnId}:hit`, rewardedAfter - rewardedBefore, session);
        let respect = hit.respect, respectDelta = hit.applied;
        const broken = dialog.defeat < 100 && defeatAfter === 100 && dialog.brokenArmed;
        const newMessages: Omit<BattleMessage, '_id' | 'seq' | 'dialogId' | 'userId'>[] = [{
          author: 'player',
          text,
          origin: 'turn',
          turnId,
        }, {
          author: 'character',
          text: actor,
          origin: 'turn',
          turnId,
        }];
        if (broken) {
          const reward = await this.respect.apply(user._id, 'break', `${turnId}:break`, 12, session);
          respect = reward.respect;
          respectDelta += reward.applied;
          const phrase = await this.phrases.pick(user, 'on_break', undefined, undefined, undefined, session);
          newMessages.push({
            author: 'character',
            text: phrase.text,
            origin: 'break',
            turnId,
          });
        }
        const saved = await this.store.append(dialog, newMessages, session);
        const balance = await this.strikes.balance(user._id, session);
        const response: TurnResponseView = {
          damage: calculation.damage,
          defeatBefore: dialog.defeat,
          defeatAfter,
          mode,
          respect,
          respectDelta,
          messages: saved.map(row => present(row, messageFields)),
          strikesBalance: balance.balance,
        };
        await this.db.model('BattleDialog').updateOne({
          _id: dialog._id,
          activeTurnId: turnId,
        }, {
          $set: {
            defeat: defeatAfter,
            defeatAt: new Date(),
            defeatAtLastTurn: defeatAfter,
            rewardedSteps: rewardedAfter,
            brokenArmed: broken ? false : dialog.brokenArmed,
          },
          $unset: { activeTurnId: 1 },
        }, { session });
        await this.db.model('Turn').updateOne({
          _id: turnId,
          status: 'judged',
        }, {
          $set: {
            status: 'done',
            damage: calculation.damage,
            defeatBefore: dialog.defeat,
            defeatAfter,
            mode,
            respectDelta,
            result: response,
          },
        }, { session });
        await this.analytics.event('turn', user._id, { damage: calculation.damage }, session);
        await this.db.model('StrikeOperation').updateOne({
          turnId,
          type: 'spend',
        }, { $set: { economicState: 'consumed' } }, { session });
        return response;
      });
      return {
        result,
        repeated: false,
      };
    } catch {
      await this.failTurn(turnId);
      throw new BattleError(502, 'turn_failed');
    }
  }

  async failTurn(id: string): Promise<void> {
    await this.db.transaction(async (session) => {
      const turn = await this.db.model('Turn').findOneAndUpdate({
        _id: id,
        status: { $in: ['reserved', 'judged'] },
      }, {
        $set: {
          status: 'failed',
          failReason: 'internal',
        },
      }, { session }).lean();
      if (!turn) {
        return;
      }
      await this.strikes.refundTurn(turn.userId, id, session);
      await this.db.model('BattleDialog').updateOne({
        _id: turn.dialogId,
        activeTurnId: id,
      }, { $unset: { activeTurnId: 1 } }, { session });
    });
  }
}
