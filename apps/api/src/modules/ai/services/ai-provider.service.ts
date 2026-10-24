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
    const response = await fetch(this.config.aiUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(timeout),
      headers: {
        'authorization': `Bearer ${this.config.aiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.aiModel(purpose),
        purpose,
        input,
        max_output_tokens: 800,
      }),
    });
    const text = await response.text();
    if (text.length > 16000) {
      throw new Error('AI response too large');
    }
    const data = JSON.parse(text) as ProviderResult & {
      refused?: boolean;
    };
    if (data.refused) {
      throw new AiProviderFailure('refusal', data);
    }
    if (!response.ok) {
      throw new AiProviderFailure('error', data);
    }
    return data;
  }
}
