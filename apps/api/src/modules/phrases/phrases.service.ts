import { PhrasesError } from './phrases.errors';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '../../common/events/event-publisher.service';
import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../database/database.service';
import { ApiError } from '../../common/errors/api-error';
import { present, pageSize } from '../../common/utils/presentation';
import type { PageInput } from '../../common/utils/presentation';
import { decodeCursor, encodeCursor } from '../../common/utils/pagination';
import type { Phrase } from '../../database/schemas/phrase.schema';
import type { User } from '../../database/schemas/user.schema';
import { AnalyticsService } from '../analytics/analytics.service';
import { AiService } from '../ai/ai.service';
import { renderPhrase } from './helpers/render';
import type { CreatePhraseRequestView, PhraseResponseView, PhraseListResponseView, PhraseItemsResponseView, PhraseCoverageResponseView } from './phrases.types';
const fields = ['id', 'role', 'category', 'level', 'defeatLevel', 'combo', 'template', 'source', 'author', 'status', 'shows', 'votes', 'scoreSum', 'belowThreshold'];
export const rateableCategories = ['on_reminder', 'on_check_in', 'on_check_in_missed', 'on_fail', 'on_absent'];
@Injectable()
export class PhrasesService {
  constructor(private readonly db: DatabaseService, private readonly analytics: AnalyticsService, private readonly ai: AiService, private readonly events: EventPublisher) { }
  async list(input: PageInput & {
    role?: string;
    category?: string;
    level?: number;
    defeatLevel?: string;
    combo?: string;
    status?: string;
    belowThreshold?: boolean;
    sort?: string;
  }): Promise<PhraseListResponseView> {
    const { limit: unused, cursor: unusedCursor, sort, ...rawFilter } = input;
    void unused;
    void unusedCursor;
    const filter = Object.fromEntries(Object.entries(rawFilter).filter(([, value]) => value !== undefined));
    const cursor = decodeCursor(input.cursor), limit = pageSize(input);
    const separator = cursor?.indexOf('_') ?? -1;
    const cursorId = sort ? (separator >= 0 ? cursor?.slice(separator + 1) : undefined) : cursor;
    const value = sort && cursor ? Number(cursor.slice(0, separator)) : undefined;
    if (sort && cursor && (!cursorId || !Number.isFinite(value))) {
      throw ApiError.invalidRequest();
    }
    const avg = sort === 'avg';
    const rows = await this.db.model('Phrase').aggregate<Phrase & {
      sortValue: number;
    }>([
      { $match: filter },
      { $addFields: { sortValue: avg ? { $divide: ['$scoreSum', { $max: ['$votes', 1] }] } : '$shows' } },
      ...(cursorId
        ? [{
            $match: sort
              ? {
                  $or: [{ sortValue: { [avg ? '$gt' : '$lt']: value } }, {
                    sortValue: value,
                    _id: { $lt: cursorId },
                  }],
                }
              : { _id: { $lt: cursorId } },
          }]
        : []),
      {
        $sort: sort
          ? {
              sortValue: avg ? 1 as const : -1 as const,
              _id: -1 as const,
            }
          : { _id: -1 as const },
      },
      { $limit: limit + 1 },
    ]);
    const last = rows[limit - 1];
    return {
      items: rows.slice(0, limit).map(row => present(row, fields)),
      nextCursor: rows.length > limit ? encodeCursor(sort ? `${last.sortValue}_${last._id}` : last._id) : null,
    };
  }

  async create(input: CreatePhraseRequestView): Promise<PhraseResponseView> {
    if (!input.template.trim()) {
      throw ApiError.invalidRequest();
    }
    return this.db.transaction(async (session) => {
      const [phrase] = await this.db.model('Phrase').create([{
        ...input,
        status: 'enabled',
        shows: 0,
        votes: 0,
        scoreSum: 0,
        belowThreshold: false,
      }], { session });
      await this.analytics.journal('phrase_add', undefined, phrase._id, {}, session);
      return present(phrase.toObject(), fields);
    });
  }

  async setStatus(id: string, status: 'enabled' | 'disabled'): Promise<PhraseResponseView> {
    return this.db.transaction(async (session) => {
      const phrase = await this.db.model('Phrase').findById(id).session(session).lean();
      if (!phrase) {
        throw ApiError.notFound();
      }
      if (status === 'disabled' && await this.isLast(phrase, session)) {
        throw new PhrasesError(409, 'last_enabled_phrase');
      }
      await this.db.model('Phrase').updateOne({ _id: id }, { $set: { status } }, { session });
      await this.analytics.journal(phrase.status === 'pending_review' ? 'paraphrase_review' : 'phrase_toggle', undefined, id, { status }, session);
      return present({
        ...phrase,
        status,
      }, fields);
    });
  }

  async paraphrases(id: string): Promise<PhraseItemsResponseView> {
    const phrase = await this.db.model('Phrase').findById(id).lean();
    if (!phrase) {
      throw ApiError.notFound();
    }
    const templates = await this.ai.paraphrase(phrase.template);
    const rows = await this.db.model('Phrase').create(templates.map(template => ({
      role: phrase.role,
      category: phrase.category,
      level: phrase.level,
      defeatLevel: phrase.defeatLevel,
      combo: phrase.combo,
      template,
      source: 'paraphrase',
      status: 'pending_review',
      shows: 0,
      votes: 0,
      scoreSum: 0,
      belowThreshold: false,
    })));
    this.events.publish('phrase.paraphrases.generated', {
      phraseId: phrase._id,
      generatedIds: Object.freeze(rows.map(row => row._id)),
      count: rows.length,
      at: new Date().toISOString(),
    });
    return { items: rows.map(row => present(row.toObject(), fields)) };
  }

  async pick(user: User, category: string, level?: number, task?: string, deadline?: Date, session?: ClientSession, anonymous = false): Promise<{
    text: string;
    phraseId?: string;
  }> {
    const dialog = await this.db.model('BattleDialog').findOne({
      userId: user._id,
      role: user.role,
    }).session(session ?? null).lean();
    const defeat = dialog ? Math.max(0, dialog.defeat - (Date.now() - dialog.defeatAt.getTime()) / 86400000 * 25) : 0;
    const defeatLevel = defeat < 20 ? '1' : defeat < 50 ? '2' : defeat < 80 ? '3' : '4';
    const combo = `${user.role}_${user.gender === 'female' ? 'daughter' : 'son'}`;
    let candidates = await this.db.model('Phrase').find({
      status: 'enabled',
      role: { $in: [user.role, 'any'] },
      category,
      ...(level ? { level } : {}),
      defeatLevel: { $in: [defeatLevel, 'any'] },
      combo: { $in: [combo, 'any'] },
    }).session(session ?? null).lean();
    if (!candidates.length) {
      return { text: '' };
    }
    const settings = await this.analytics.settings();
    const key = `${category}:${level ?? 0}`;
    const state = await this.db.model('PhraseShowState').findOne({ userId: user._id }).session(session ?? null).lean();
    const window = Math.min(5, candidates.length - 1);
    const recent = (state?.recent[key] ?? []).slice(-window);
    const allowed = candidates.filter(p => !recent.includes(p._id));
    if (allowed.length) {
      candidates = allowed;
    }
    const hasTrials = candidates.some(p => p.shows < settings.banditParams.trialShows);
    const weight = (p: Phrase): number => (p.defeatLevel === 'any' ? 1 : 2) * (p.combo === 'any' ? 1 : 2) * (hasTrials ? 1 : Math.exp(3 * p.scoreSum / Math.max(1, p.votes)) + Math.sqrt(Math.log(p.shows + 2) / (p.votes + 1)));
    let choice = Math.random() * candidates.reduce((sum, p) => sum + weight(p), 0);
    const phrase = candidates.find((p) => {
      choice -= weight(p);
      return choice <= 0;
    }) ?? candidates[0];
    await this.db.model('Phrase').updateOne({ _id: phrase._id }, { $inc: { shows: 1 } }, { session });
    await this.db.model('PhraseShowState').updateOne({ userId: user._id }, { $set: { [`recent.${key}`]: [...recent, phrase._id].slice(-5) } }, {
      upsert: true,
      session,
    });
    return {
      text: renderPhrase(phrase.template, user, settings, task, deadline, anonymous),
      phraseId: phrase._id,
    };
  }

  async rate(userId: string, feedId: string, score: 0 | 1 | 2): Promise<void> {
    const settings = await this.analytics.settings();
    await this.db.transaction(async (session) => {
      const feed = await this.db.model('FeedMessage').findOne({
        _id: feedId,
        userId,
        draft: { $ne: true },
        $or: [{ category: { $ne: 'on_check_in' } }, { telegramMessageId: { $exists: true } }],
      }).session(session).lean();
      if (!feed || !feed.phraseId) {
        throw ApiError.notFound();
      }
      if (!rateableCategories.includes(feed.category)) {
        throw ApiError.invalidRequest();
      }
      const previous = await this.db.model('PhraseVote').findOne({
        userId,
        phraseId: feed.phraseId,
      }).session(session).lean();
      if (previous) {
        if (previous.score !== score) {
          throw new PhrasesError(409, 'already_rated');
        }
        await this.db.model('FeedMessage').updateOne({ _id: feedId }, { $set: { rating: score } }, { session });
        return;
      }
      await this.db.model('PhraseVote').create([{
        userId,
        phraseId: feed.phraseId,
        score,
        at: new Date(),
      }], { session });
      const phrase = await this.db.model('Phrase').findByIdAndUpdate(feed.phraseId, {
        $inc: {
          votes: 1,
          scoreSum: score,
        },
      }, {
        new: true,
        session,
      }).lean();
      if (!phrase) {
        throw ApiError.notFound();
      }
      const below = phrase.votes >= settings.banditParams.disableVotes && phrase.scoreSum / phrase.votes < settings.banditParams.disableAvg;
      await this.db.model('Phrase').updateOne({ _id: phrase._id }, {
        $set: {
          belowThreshold: below,
          ...(below && !await this.isLast(phrase, session) ? { status: 'disabled' } : {}),
        },
      }, { session });
      await this.db.model('FeedMessage').updateMany({
        userId,
        phraseId: feed.phraseId,
      }, { $set: { rating: score } }, { session });
      await this.analytics.event('phrase_rated', userId, { score }, session);
    });
  }

  async coverage(): Promise<PhraseCoverageResponseView> {
    const phrases = await this.db.model('Phrase').find({ status: 'enabled' }).lean();
    const minimums: Record<string, number> = {
      on_greeting: 5,
      on_task_set: 8,
      on_delete: 5,
      on_vague: 5,
      on_reminder: 5,
      on_check_in: 5,
      on_check_in_reply: 5,
      on_check_in_missed: 5,
      on_fail: 12,
      on_excuse: 7,
      on_excuse_denied: 3,
      on_retry: 3,
      on_success: 8,
      on_absent: 4,
      on_battle_start: 5,
      on_break: 5,
      on_recovery: 3,
    };
    const items: PhraseCoverageResponseView['items'] = [];
    for (const role of ['father', 'mother'] as const) {
      for (const [category, minimum] of Object.entries(minimums)) {
        const levels = ['on_reminder', 'on_check_in', 'on_absent'].includes(category) ? [1, 2, 3] : category === 'on_check_in_reply' ? [1, 2] : [undefined];
        for (const level of levels) {
          for (const defeatLevel of ['any', '1', '2', '3', '4'] as const) {
            for (const combo of ['any', 'father_son', 'father_daughter', 'mother_son', 'mother_daughter'] as const) {
              const enabledCount = phrases.filter(p => [role, 'any'].includes(p.role) && p.category === category && p.level === level && p.defeatLevel === defeatLevel && p.combo === combo).length;
              const required = defeatLevel === 'any' && combo === 'any' ? minimum : ['2', '3', '4'].includes(defeatLevel) && combo === 'any' && ['on_reminder', 'on_check_in', 'on_fail'].includes(category) ? 2 : 0;
              items.push({
                role,
                category: category as PhraseResponseView['category'],
                ...(level ? { level } : {}),
                defeatLevel,
                combo,
                enabledCount,
                required,
              });
            }
          }
        }
      }
    }
    return { items };
  }

  private async isLast(phrase: Phrase, session: ClientSession): Promise<boolean> {
    if (phrase.status !== 'enabled' || phrase.defeatLevel !== 'any' || phrase.combo !== 'any') {
      return false;
    }
    return await this.db.model('Phrase').countDocuments({
      role: phrase.role,
      category: phrase.category,
      level: phrase.level ?? { $exists: false },
      defeatLevel: 'any',
      combo: 'any',
      status: 'enabled',
    }).session(session) <= 1;
  }
}
