import { record } from './prompt-data';
import type { ProviderUsage } from '../services/ai-provider.service';

export function responseUsage(value: unknown, rates: { input: number;
  output: number; }): ProviderUsage {
  const usage = record(value);
  const inputTokens = tokens(usage.prompt_tokens);
  const completionTokens = tokens(usage.completion_tokens);
  const reasoningTokens = tokens(record(usage.completion_tokens_details).reasoning_tokens) ?? 0;
  const totalTokens = tokens(usage.total_tokens);
  // xAI can report reasoning separately from completion_tokens. Avoid adding it
  // twice for compatible endpoints whose total already includes it in completion.
  const reasoningIncluded = inputTokens !== undefined && completionTokens !== undefined && totalTokens === inputTokens + completionTokens;
  const outputTokens = completionTokens === undefined ? undefined : tokens(completionTokens + (reasoningIncluded ? 0 : reasoningTokens));
  return {
    inputTokens,
    outputTokens,
    costMicros: inputTokens !== undefined && outputTokens !== undefined ? inputTokens * rates.input + outputTokens * rates.output : undefined,
  };
}
function tokens(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
export function validValue(purpose: string, value: unknown): boolean {
  const row = record(value);
  if (purpose === 'specificity') {
    return Object.keys(row).sort().join(',') === 'size,specific' && typeof row.specific === 'boolean' && ['micro', 'medium', 'large'].includes(String(row.size));
  }
  if (purpose === 'judge') {
    return Object.keys(row).sort().join(',') === 'corner,hit,logic,originality,weakSpotHit'
      && [row.hit, row.logic, row.originality].every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10)
      && typeof row.corner === 'boolean' && (row.weakSpotHit === null || typeof row.weakSpotHit === 'string');
  }
  if (purpose === 'paraphrase') {
    return Array.isArray(value) && value.length > 0 && value.length <= 20 && value.every(v => typeof v === 'string' && v.trim().length > 0 && v.length < 4000);
  }
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }
  return purpose === 'summary' ? value.length <= 8000 : purpose === 'actor' && value.length <= 2000 && (value.match(/[.!?]+(?:\s|$)/g)?.length ?? 1) <= 3;
}

// Bound the body while reading, including error bodies; never include it in errors.
export async function boundedBody(response: Response): Promise<string> {
  if (!response.body) {
    return '';
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > 65536) {
        await reader.cancel();
        throw new RangeError('AI response too large');
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally {
    reader.releaseLock();
  }
}
