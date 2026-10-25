import { isDuplicateKey } from '../../common/utils/mongo-error';
import { AiError } from './ai.errors';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppConfigService } from '../../config/app-config.service';
import { localDate } from '../../common/utils/time';
import { AnalyticsService } from '../analytics/analytics.service';
import { AiProvider, AiProviderFailure } from './services/ai-provider.service';
import type { ProviderUsage } from './services/ai-provider.service';
import { usageCost } from './helpers/usage-cost';
import { unsafeReply } from './helpers/injection';
import type { User } from '../../database/schemas/user.schema';
export interface Judge {
  hit: number;
  logic: number;
  originality: number;
  corner: boolean;
  weakSpotHit: string | null;
}
function validZone(zone: string): string {
  try {
    new Intl.DateTimeFormat('ru', { timeZone: zone });
    return zone;
  } catch {
    return 'UTC';
  }
}
@Injectable()
export class AiService {
  constructor(private readonly db: DatabaseService, private readonly config: AppConfigService, private readonly analytics: AnalyticsService, private readonly provider: AiProvider) { }
  // Один вызов модели: конкретность, размер и едкая реплика на задачу. Нет реплики: вызывающий берёт заготовленную фразу.
  async checkTask(user: User, title: string, reply?: { deadline?: Date }): Promise<{
    specific: boolean;
    size: 'micro' | 'medium' | 'large';
    reply: string | null;
  }> {
    const userId = user._id;
    // Неверная зона в профиле не должна ломать создание задачи: считаем по UTC.
    const zone = validZone(user.timeZone);
    const deadline = reply?.deadline;
    const settings = await this.analytics.settings();
    const day = localDate(new Date(), zone);
    await this.db.model('DailyCounter').updateOne({
      userId,
      kind: 'specificity',
      localDate: day,
    }, {
      $setOnInsert: {
        count: 0,
        expiresAt: new Date(Date.now() + 4 * 86400000),
      },
    }, { upsert: true }).catch((error: unknown) => {
      if (!isDuplicateKey(error)) {
        throw error;
      }
    });
    const counter = await this.db.model('DailyCounter').findOneAndUpdate({
      userId,
      kind: 'specificity',
      localDate: day,
      count: { $lt: settings.aiDailyLimit },
    }, { $inc: { count: 1 } }).lean();
    if (!counter) {
      throw new AiError(429, 'daily_limit_reached');
    }
    try {
      const now = new Date();
      let context: Record<string, unknown> = {};
      if (reply) {
        const format = (timeZone: string) => new Intl.DateTimeFormat('ru', {
          timeZone,
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        const formatter = format(zone);
        context = {
          role: user.role,
          gender: user.gender,
          now: formatter.format(now),
          deadline: deadline ? formatter.format(deadline) : undefined,
          leftMinutes: deadline ? Math.max(0, Math.round((deadline.getTime() - now.getTime()) / 60000)) : undefined,
          recurring: !deadline,
          withReply: true,
        };
      }
      // Реплику пишем только при создании задачи; при правке названия хватает короткой оценки.
      const call = await this.call('specificity', {
        title,
        ...context,
      }, userId, undefined, reply ? 5000 : 3000);
      const result = call.value as {
        specific?: unknown;
        size?: unknown;
        reply?: unknown;
      };
      if (!result || typeof result.specific !== 'boolean' || !['micro', 'medium', 'large'].includes(String(result.size))) {
        await this.markInvalid(call.id);
        throw new Error('Invalid specificity');
      }
      // Сбой реплики не ломает оценку: вместо неё остаётся заготовленная фраза.
      const text = reply && typeof result.reply === 'string' ? result.reply.trim() : '';
      // reply не строка (null и т.п.) - это просто нет реплики, а не сбой оценки.
      const usable = Boolean(text) && text.length <= 300 && !unsafeReply(text);
      if (text && !usable) {
        await this.markInvalid(call.id);
      }
      return {
        specific: result.specific,
        size: result.size as 'micro' | 'medium' | 'large',
        reply: usable ? text : null,
      };
    } catch {
      throw new AiError(503, 'ai_unavailable');
    }
  }

  async judge(input: Record<string, unknown>, userId: string, turnId: string, weakSpots: string[], expiresAt: number): Promise<Judge> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const call = await this.call('judge', {
        ...input,
      }, userId, turnId, Math.max(1, expiresAt - Date.now())).catch((error: unknown) => {
        if (error instanceof AiProviderFailure && error.outcome === 'invalid' && attempt < 2 && Date.now() < expiresAt) {
          return undefined;
        }
        throw error;
      });
      if (!call) {
        continue;
      }
      const result = call.value as Judge;
      if (result && [result.hit, result.logic, result.originality].every(v => Number.isInteger(v) && v >= 0 && v <= 10) && typeof result.corner === 'boolean' && (result.weakSpotHit === null || typeof result.weakSpotHit === 'string')) {
        return {
          ...result,
          weakSpotHit: result.weakSpotHit !== null && weakSpots.includes(result.weakSpotHit) ? result.weakSpotHit : null,
        };
      }
      await this.markInvalid(call.id);
    }
    throw new Error('Invalid judge');
  }

  async act(input: Record<string, unknown>, userId: string, turnId: string, expiresAt: number): Promise<string> {
    const call = await this.call('actor', {
      ...input,
    }, userId, turnId, Math.max(1, expiresAt - Date.now()));
    const result = call.value;
    if (typeof result !== 'string' || !result.trim() || result.length > 2000 || (result.match(/[.!?]+(?:\s|$)/g)?.length ?? 1) > 3) {
      await this.markInvalid(call.id);
      throw new Error('Invalid actor');
    }
    return result;
  }

  async paraphrase(template: string): Promise<string[]> {
    const call = await this.call('paraphrase', {
      template,
    });
    const result = call.value;
    if (!Array.isArray(result) || result.length > 20 || !result.every(v => typeof v === 'string' && v.length > 0 && v.length < 4000)) {
      await this.markInvalid(call.id);
      throw new AiError(503, 'ai_unavailable');
    }
    return result as string[];
  }

  async summarize(input: Record<string, unknown>, userId: string, turnId?: string): Promise<string> {
    const call = await this.call('summary', input, userId, turnId);
    const value = call.value;
    if (typeof value !== 'string' || value.length > 8000) {
      await this.markInvalid(call.id);
      throw new Error('Invalid summary');
    }
    return value;
  }

  private async markInvalid(id: string): Promise<void> {
    await this.db.model('AiCall').updateOne({ _id: id }, { $set: { outcome: 'invalid' } });
  }

  private async call(purpose: string, input: Record<string, unknown>, userId?: string, turnId?: string, timeout = 15000): Promise<{
    value: unknown;
    id: string;
  }> {
    const start = Date.now();
    let outcome = 'error';
    let usage: ProviderUsage | undefined;
    const rates = this.config.aiRates(purpose);
    // Write before calling: a crash or accounting update failure leaves an unknown,
    // pending bill, instead of silently dropping this attempt from the cost metric.
    const record = await this.db.transaction(async (session) => {
      if (userId) {
        const user = await this.db.model('User').updateOne({
          _id: userId,
          deleting: { $ne: true },
        }, { $inc: { activityRevision: 1 } }, { session });
        if (!user.matchedCount) {
          throw new Error('AI account unavailable');
        }
      }
      const [row] = await this.db.model('AiCall').create([{
        purpose,
        provider: this.config.testClients ? 'test' : 'configured',
        model: this.config.aiModel(purpose),
        userId,
        turnId,
        inputUsdPerMillion: rates.input,
        outputUsdPerMillion: rates.output,
        costSource: this.config.testClients ? 'mock' : 'unknown',
        outcome: 'pending',
        latencyMs: 0,
        at: new Date(start),
      }], { session });
      return row.toObject();
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([this.provider.call(purpose, input, timeout), new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new AiProviderFailure('timeout')), timeout);
      })]);
      usage = result;
      outcome = 'ok';
      return {
        value: result.value,
        id: record._id,
      };
    } catch (error) {
      if (error instanceof AiProviderFailure) {
        usage = error.usage;
      }
      outcome = error instanceof AiProviderFailure ? error.outcome : error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'timeout' : 'error';
      throw error;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
      // Promise.race cannot reconcile usage arriving after the local timeout.
      await this.db.model('AiCall').updateOne({ _id: record._id }, {
        $set: {
          ...usageCost(usage, rates, this.config.testClients),
          outcome,
          latencyMs: Date.now() - start,
        },
      });
    }
  }
}
