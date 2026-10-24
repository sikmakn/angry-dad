import { Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import { ApiError } from '../../common/errors/api-error';
import { localDate } from '../../common/utils/time';
import type { RespectChange } from '../../database/schemas/respect-change.schema';
@Injectable()
export class RespectService {
  constructor(private readonly db: DatabaseService) { }
  async apply(userId: string, reason: RespectChange['reason'], eventKey: string, delta: number, session: ClientSession, at = new Date()): Promise<{
    respect: number;
    applied: number;
  }> {
    const user = await this.db.model('User').findById(userId).session(session).lean();
    if (!user || user.deleting) {
      throw ApiError.notFound();
    }
    const previous = await this.db.model('RespectChange').findOne({
      userId,
      eventKey,
    }).session(session).lean();
    if (previous) {
      return {
        respect: user.respect,
        applied: previous.applied,
      };
    }
    const day = localDate(at, user.timeZone);
    if (reason === 'missed_check_in') {
      const penalties = await this.db.model('RespectChange').find({
        userId,
        reason,
        localDate: day,
      }).session(session).lean();
      delta = -Math.min(Math.abs(delta), Math.max(0, 3 + penalties.reduce((sum, row) => sum + row.applied, 0)));
    }
    if (reason === 'break' && user.lastBreakRewardAt && at.getTime() - user.lastBreakRewardAt.getTime() < 3 * 86400000) {
      delta = 0;
    }
    const cap = reason === 'break' ? 100 : Math.max(94, user.respect);
    const respect = Math.max(0, Math.min(cap, user.respect + Math.floor(delta * 2) / 2));
    const applied = respect - user.respect;
    await this.db.model('User').updateOne({
      _id: userId,
      deleting: { $ne: true },
    }, {
      $set: {
        respect,
        ...(reason === 'break' && applied > 0
          ? {
              respectFromBreak: respect > 94,
              lastBreakRewardAt: at,
            }
          : {}),
      },
    }, { session });
    await this.db.model('RespectChange').create([{
      userId,
      reason,
      delta,
      applied,
      eventKey,
      localDate: day,
      at,
    }], { session });
    return {
      respect,
      applied,
    };
  }
}
