import { Injectable } from '@nestjs/common';
import { DatabaseService } from './../../../database/database.service';
import { AiService } from './../../ai/ai.service';
import { TurnService } from './turn.service';
@Injectable()
export class TurnRecoveryService {
  private dialogCursor?: string;
  constructor(private readonly db: DatabaseService, private readonly ai: AiService, private readonly turns: TurnService) { }
  async recover(): Promise<void> {
    const turns = await this.db.model('Turn').find({
      status: { $in: ['reserved', 'judged'] },
      startedAt: { $lt: new Date(Date.now() - 45000) },
    }).limit(100).lean();
    for (const turn of turns) {
      await this.turns.failTurn(turn._id);
    }
    const dialogs = await this.db.model('BattleDialog').find({
      activeTurnId: { $exists: false },
      ...(this.dialogCursor === undefined ? {} : { _id: { $gt: this.dialogCursor } }),
    }).sort({ _id: 1 }).limit(100).lean();
    if (!dialogs.length) {
      this.dialogCursor = undefined;
    }
    for (const dialog of dialogs) {
      // Advance before processing so short histories and failures cannot stall the sweep.
      this.dialogCursor = dialog._id;
      const rows = await this.db.model('BattleMessage').find({
        dialogId: dialog._id,
        seq: { $gt: dialog.summaryUpTo ?? 0 },
      }).sort({ seq: 1 }).lean();
      if (rows.length <= 20) {
        continue;
      }
      const compress = rows.slice(0, -8);
      const summary = await this.ai.summarize({
        summary: dialog.summary,
        messages: compress.map(row => ({
          author: row.author,
          text: row.text,
        })),
      }, dialog.userId, [...compress].reverse().find(row => row.turnId)?.turnId);
      await this.db.model('BattleDialog').updateOne({
        _id: dialog._id,
        summaryUpTo: dialog.summaryUpTo ?? { $exists: false },
      }, {
        $set: {
          summary,
          summaryUpTo: compress[compress.length - 1].seq,
        },
      });
    }
  }
}
