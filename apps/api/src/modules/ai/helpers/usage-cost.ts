import type { ProviderUsage } from '../services/ai-provider.service';
export function usageCost(usage: ProviderUsage | undefined, rates: {
  input: number;
  output: number;
}, mock: boolean): {
  inputTokens?: number;
  outputTokens?: number;
  costMicros?: number;
  costSource: 'provider' | 'estimate' | 'mock' | 'unknown';
} {
  const inputTokens = validTokens(usage?.inputTokens);
  const outputTokens = validTokens(usage?.outputTokens);
  const reported = usage?.costMicros;
  const providerCost = typeof reported === 'number' && Number.isFinite(reported) && reported >= 0 && reported <= Number.MAX_SAFE_INTEGER ? reported : undefined;
  // USD per million tokens numerically equals micro-USD per token.
  const estimate = inputTokens !== undefined && outputTokens !== undefined ? inputTokens * rates.input + outputTokens * rates.output : undefined;
  const costMicros = providerCost ?? (estimate !== undefined && Number.isFinite(estimate) && estimate <= Number.MAX_SAFE_INTEGER ? estimate : undefined);
  return {
    inputTokens,
    outputTokens,
    costMicros,
    costSource: mock ? 'mock' : providerCost !== undefined ? 'provider' : costMicros !== undefined ? 'estimate' : 'unknown',
  };
}

function validTokens(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
