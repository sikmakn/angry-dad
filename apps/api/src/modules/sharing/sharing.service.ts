import { SharingError } from './sharing.errors';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { DatabaseService } from '../../database/database.service';
import type { User } from '../../database/schemas/user.schema';
import { AppConfigService } from '../../config/app-config.service';
import { ApiError } from '../../common/errors/api-error';
import { PhrasesService } from '../phrases/phrases.service';
import { BattleService } from '../battle/battle.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { TelegramClient } from '../bot/services/telegram-client.service';
import { renderPhrase } from '../phrases/helpers/render';
import type { CreateShareRequestView, ShareResponseView } from './sharing.types';
const escapeXml = (text: string): string => text.replace(/[<>&"']/g, c => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&apos;',
})[c]!);
@Injectable()
export class SharingService {
  constructor(private readonly db: DatabaseService, private readonly phrases: PhrasesService, private readonly battle: BattleService, private readonly analytics: AnalyticsService, private readonly telegram: TelegramClient, private readonly config: AppConfigService) { }
  async create(user: User, input: CreateShareRequestView): Promise<ShareResponseView> {
    if ((input.kind === 'battle' && (!input.role || input.periodId)) || (input.kind !== 'battle' && (!input.periodId || input.role))) {
      throw ApiError.invalidRequest();
    }
    let defeat: number | undefined, text: string;
    if (input.kind === 'battle') {
      const dialog = await this.battle.dialog(user, input.role!);
      defeat = dialog.defeat;
      text = (await this.phrases.pick(user, defeat >= 100 ? 'on_break' : 'on_battle_start', undefined, undefined, undefined, undefined, true)).text;
    } else {
      const period = await this.db.model('Period').findOne({
        _id: input.periodId,
        userId: user._id,
      }).lean();
      if (!period) {
        throw ApiError.notFound();
      }
      const task = await this.db.model('Task').findOne({
        _id: period.taskId,
        userId: user._id,
        deletedAt: { $exists: false },
      }).lean();
      if (!task) {
        throw ApiError.notFound();
      }
      if ((input.kind === 'done' && period.status !== 'done') || (input.kind === 'fail' && period.status !== 'failed')) {
        throw ApiError.invalidRequest();
      }
      const feed = await this.db.model('FeedMessage').findOne({
        userId: user._id,
        periodId: period._id,
        draft: { $ne: true },
        category: input.kind === 'done' ? 'on_success' : 'on_fail',
      }).sort({ sentAt: -1 }).lean();
      const phrase = feed?.phraseId ? await this.db.model('Phrase').findById(feed.phraseId).lean() : null;
      text = phrase ? renderPhrase(phrase.template, user, await this.analytics.settings(), undefined, period.deadline, true) : (await this.phrases.pick(user, input.kind === 'done' ? 'on_success' : 'on_fail', undefined, undefined, period.deadline, undefined, true)).text;
    }
    try {
      const words = text.split(/\s+/), lines: string[] = [];
      let line = '';
      for (const word of words) {
        if ((line + word).length > 35) {
          lines.push(line);
          line = '';
        }
        line += `${word} `;
      }
      if (line) {
        lines.push(line);
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650"><rect width="1000" height="650" fill="#17151c"/><g fill="#f4dfb5" font-family="sans-serif"><text x="70" y="90" font-size="38">${user.role === 'mother' ? 'МАМА' : 'БАТЯ'} · ${input.kind === 'battle' ? `Авторитет ${Math.floor(Math.max(0, Math.min(100, 100 - defeat!)))}%` : input.kind === 'done' ? 'ЗАДАЧА СДЕЛАНА' : 'ЗАДАЧА ПРОВАЛЕНА'}</text>${lines.slice(0, 8).map((line, index) => `<text x="70" y="${170 + index * 44}" font-size="32">${escapeXml(line)}</text>`).join('')}<text x="70" y="600" font-size="24">${escapeXml(this.config.botUrl)}</text></g></svg>`;
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      const preparedMessageId = await this.telegram.prepare(user.telegramId, png);
      await this.analytics.event('share', user._id, { kind: input.kind });
      return { preparedMessageId };
    } catch {
      throw new SharingError(503, 'share_failed');
    }
  }
}
