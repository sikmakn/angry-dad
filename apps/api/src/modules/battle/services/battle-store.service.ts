import { repeatedResult } from '../../../common/utils/idempotency-result';
import { BattleError } from '../battle.errors';
import { messageFields } from '../helpers/message-fields';
import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from './../../../database/database.service';
import type { User } from './../../../database/schemas/user.schema';
import type { BattleDialog } from './../../../database/schemas/battle-dialog.schema';
import type { BattleMessage } from './../../../database/schemas/battle-message.schema';
import { ApiError } from './../../../common/errors/api-error';
import { present, pageSize } from './../../../common/utils/presentation';
import type { PageInput } from './../../../common/utils/presentation';
import { decodeCursor, encodeCursor } from './../../../common/utils/pagination';
import { PhrasesService } from './../../phrases/phrases.service';
import { AnalyticsService } from './../../analytics/analytics.service';
import { battleMode } from './../helpers/damage';
import type { BattleDialogResponseView, BattleMessageResponseView, BattleMessageListResponseView, RoleCardResponseView, ReplaceRoleCardRequestView } from './../battle.types';
@Injectable()
export class BattleStoreService {
  constructor(private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly analytics: AnalyticsService) { }
  async dialog(user: User, role: 'father' | 'mother'): Promise<BattleDialog> {
    if (user.role !== role) {
      throw new BattleError(409, 'role_mismatch');
    }
    let dialog = await this.db.model('BattleDialog').findOne({
      userId: user._id,
      role,
    }).lean();
    if (!dialog) {
      dialog = await this.db.transaction(async (session) => {
        const row = await this.db.model('BattleDialog').findOneAndUpdate({
          userId: user._id,
          role,
        }, {
          $setOnInsert: {
            defeat: 0,
            defeatAt: new Date(),
            brokenArmed: true,
            defeatAtLastTurn: 0,
            rewardedSteps: 0,
            nextSeq: 0,
          },
        }, {
          upsert: true,
          new: true,
          session,
        }).lean();
        if (!row) {
          throw ApiError.notFound();
        }
        if (!row.nextSeq) {
          const phrase = await this.phrases.pick(user, 'on_battle_start', undefined, undefined, undefined, session);
          await this.append(row, [{
            author: 'character',
            text: phrase.text,
            origin: 'battle_start',
          }], session);
        }
        return row;
      });
    }
    const defeat = Math.max(0, dialog.defeat - (Date.now() - dialog.defeatAt.getTime()) / 86400000 * 25);
    return {
      ...dialog,
      defeat,
      brokenArmed: dialog.brokenArmed || defeat < 75,
    };
  }

  async getDialog(user: User, role: 'father' | 'mother'): Promise<BattleDialogResponseView> {
    const dialog = await this.dialog(user, role);
    return {
      role,
      defeat: dialog.defeat,
      defeatAt: dialog.defeatAt.toISOString(),
      mode: battleMode(dialog.defeat),
      turnInProgress: Boolean(dialog.activeTurnId),
    };
  }

  async messages(user: User, role: 'father' | 'mother', input: PageInput): Promise<BattleMessageListResponseView> {
    const dialog = await this.dialog(user, role);
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const seq = cursor === undefined ? undefined : Number(cursor);
    if (seq !== undefined && !Number.isInteger(seq)) {
      throw ApiError.invalidRequest();
    }
    const rows = await this.db.model('BattleMessage').find({
      dialogId: dialog._id,
      ...(seq ? { seq: { $lt: seq } } : {}),
    }).sort({ seq: -1 }).limit(limit + 1).lean();
    return {
      items: rows.slice(0, limit).map(row => present(row, messageFields)),
      nextCursor: rows.length > limit ? encodeCursor(String(rows[limit - 1].seq)) : null,
    };
  }

  async quote(user: User, role: 'father' | 'mother', feedId: string, key?: string): Promise<BattleMessageResponseView> {
    const dialog = await this.dialog(user, role);
    return this.db.transaction(async (session) => {
      const feed = await this.db.model('FeedMessage').findOne({
        _id: feedId,
        userId: user._id,
        draft: { $ne: true },
        $or: [{ category: { $ne: 'on_check_in' } }, { telegramMessageId: { $exists: true } }],
      }).session(session).lean();
      if (!feed) {
        throw ApiError.notFound();
      }
      const old = key
        ? await this.db.model('BattleMessage').findOne({
            userId: user._id,
            dialogId: dialog._id,
            clientKey: key,
          }).session(session).lean()
        : null;
      if (old) {
        if (old.feedMessageId !== feedId) {
          throw new BattleError(409, 'idempotency_key_reused');
        }
        return repeatedResult(present<BattleMessageResponseView>(old, messageFields));
      }
      const rows = await this.append(dialog, [{
        author: 'character',
        text: feed.text,
        origin: 'reply_to_feed',
        taskTitle: feed.taskTitle,
        clientKey: key,
        feedMessageId: feedId,
      }], session);
      return present(rows[0], messageFields);
    });
  }

  async roleCard(role: 'father' | 'mother'): Promise<RoleCardResponseView> {
    const card = await this.db.model('RoleCard').findOne({ role }).lean();
    if (!card) {
      throw ApiError.notFound();
    }
    return present(card, ['role', 'character', 'weakSpots']);
  }

  async replaceRoleCard(role: 'father' | 'mother', input: ReplaceRoleCardRequestView): Promise<RoleCardResponseView> {
    if (new Set(input.weakSpots.map(w => w.key)).size !== input.weakSpots.length) {
      throw ApiError.invalidRequest();
    }
    return this.db.transaction(async (session) => {
      await this.db.model('RoleCard').updateOne({ role }, {
        $set: input,
        $inc: { version: 1 },
      }, {
        session,
        upsert: true,
      });
      await this.analytics.journal('role_card_edit', undefined, role, {}, session);
      return {
        role,
        ...input,
      };
    });
  }

  async append(dialog: BattleDialog, rows: Omit<BattleMessage, '_id' | 'seq' | 'dialogId' | 'userId'>[], session: ClientSession): Promise<BattleMessage[]> {
    const updated = await this.db.model('BattleDialog').findByIdAndUpdate(dialog._id, { $inc: { nextSeq: rows.length } }, {
      new: true,
      session,
    }).lean();
    if (!updated) {
      throw ApiError.notFound();
    }
    const saved = await this.db.model('BattleMessage').create(rows.map((row, index) => ({
      ...row,
      userId: dialog.userId,
      dialogId: dialog._id,
      seq: updated.nextSeq - rows.length + index + 1,
    })), {
      session,
      ordered: true,
    });
    return saved.map(row => row.toObject());
  }
}
