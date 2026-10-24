import { specificityPrompt } from '../helpers/specificity-prompt';
import { judgePrompt } from '../helpers/judge-prompt';
import { actorPrompt } from '../helpers/actor-prompt';
import { summaryPrompt } from '../helpers/summary-prompt';
import { paraphrasePrompt } from '../helpers/paraphrase-prompt';
import { record } from '../helpers/prompt-data';
import { boundedBody, responseUsage, validValue } from '../helpers/provider-response';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
export class AiProviderFailure extends Error {
  constructor(readonly outcome: 'timeout' | 'refusal' | 'invalid' | 'error', readonly usage?: ProviderUsage) {
    super(`AI ${outcome}`);
  }
}
export interface ProviderUsage {
  inputTokens?: number;
  outputTokens?: number;
  costMicros?: number;
}
export interface ProviderResult extends ProviderUsage {
  value: unknown;
}
export abstract class AiProvider {
  abstract call(purpose: string, input: Record<string, unknown>, timeout: number): Promise<ProviderResult>;
}
@Injectable()
export class ConfiguredAiProvider extends AiProvider {
  constructor(private readonly config: AppConfigService) {
    super();
  }

  async call(purpose: string, input: Record<string, unknown>, timeout: number): Promise<ProviderResult> {
    if (this.config.testClients) {
      const value: unknown = purpose === 'specificity'
        ? {
            specific: true,
            size: 'medium',
          }
        : purpose === 'judge'
          ? {
              hit: 5,
              logic: 5,
              originality: 5,
              corner: false,
              weakSpotHit: null,
            }
          : purpose === 'paraphrase' ? [String(input.template)] : purpose === 'summary' ? 'Разговор о выполнении задач.' : 'Слова я слышал. Делом докажи.';
      return {
        value,
        inputTokens: 0,
        outputTokens: 0,
        costMicros: 0,
      };
    }
    let usage: ProviderUsage | undefined;
    const signal = AbortSignal.timeout(timeout);
    try {
      const builders = {
        specificity: specificityPrompt,
        judge: judgePrompt,
        actor: actorPrompt,
        summary: summaryPrompt,
        paraphrase: paraphrasePrompt,
      };
      const builder = builders[purpose as keyof typeof builders];
      if (!builder) {
        throw new AiProviderFailure('invalid');
      }
      const prompt = builder(input);
      const response = await fetch(this.config.aiUrl, {
        method: 'POST',
        signal,
        headers: {
          'authorization': `Bearer ${this.config.aiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.aiModel(purpose),
          messages: [{
            role: 'system',
            content: prompt.system,
          }, {
            role: 'user',
            content: JSON.stringify(prompt.data),
          }],
          // Рассуждение модели входит в лимит, поэтому запас с избытком; reasoning_effort понимает только gpt-oss.
          max_tokens: 2000,
          ...(/gpt-oss/.test(this.config.aiModel(purpose)) ? { reasoning_effort: 'low' } : {}),
          stream: false,
        }),
      });
      const body = await boundedBody(response).catch((error: unknown) => {
        if (error instanceof RangeError) {
          throw new AiProviderFailure(response.ok ? 'invalid' : 'error');
        }
        throw error;
      });
      let data: Record<string, unknown>;
      try {
        data = record(JSON.parse(body));
      } catch {
        throw new AiProviderFailure(response.ok ? 'invalid' : 'error');
      }
      usage = responseUsage(data.usage, this.config.aiRates(purpose));
      const choice = record(Array.isArray(data.choices) ? data.choices[0] : undefined);
      const message = record(choice.message);
      const error = record(data.error);
      const refusalCodes = ['content_filter', 'content_policy_violation', 'content_policy', 'safety', 'refusal'];
      if (message.refusal || choice.finish_reason === 'content_filter' || refusalCodes.includes(String(error.code)) || refusalCodes.includes(String(error.type))) {
        throw new AiProviderFailure('refusal', usage);
      }
      if (!response.ok) {
        throw new AiProviderFailure('error', usage);
      }
      if (choice.finish_reason !== 'stop' || typeof message.content !== 'string' || message.tool_calls) {
        throw new AiProviderFailure('invalid', usage);
      }
      // Людям длинные тире не нужны: чистим только тексты, которые видит пользователь.
      const dashless = (text: string): string => text.replace(/[—–]/g, '-');
      const content = message.content;
      let value: unknown = ['actor', 'summary'].includes(purpose) ? dashless(content) : content;
      if (['specificity', 'judge', 'paraphrase'].includes(purpose)) {
        try {
          value = JSON.parse(content);
          if (purpose === 'paraphrase' && Array.isArray(value)) {
            value = value.map(item => typeof item === 'string' ? dashless(item) : item);
          }
        } catch {
          throw new AiProviderFailure('invalid', usage);
        }
      }
      if (record(value).refusal === true || /^\s*\{\s*"refusal"\s*:\s*true\s*\}\s*$/.test(content)) {
        throw new AiProviderFailure('refusal', usage);
      }
      if (!validValue(purpose, value)) {
        throw new AiProviderFailure('invalid', usage);
      }
      return {
        value,
        ...usage,
      };
    } catch (error) {
      if (error instanceof AiProviderFailure) {
        throw error;
      }
      const timedOut = signal.aborted || (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name));
      throw new AiProviderFailure(timedOut ? 'timeout' : 'error', usage);
    }
  }
}
