import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../src/config/app-config.service';
import { AiProviderFailure, ConfiguredAiProvider } from '../src/modules/ai/services/ai-provider.service';
import { battleDamage, battleMode } from '../src/modules/battle/helpers/damage';
import type { Judge } from '../src/modules/ai/ai.service';

async function main(): Promise<void> {
  if (!process.env.AI_API_KEY?.trim()) {
    console.error('Для ai:eval задайте AI_API_KEY в окружении. Ключ не выводится.');
    process.exitCode = 1;
    return;
  }
  // No ConfigModule/dotenv: only the environment loaded explicitly by node.
  const config = new AppConfigService(new ConfigService({
    ...process.env,
    EXTERNAL_CLIENTS_MODE: 'real',
  }));
  const provider = new ConfiguredAiProvider(config);
  const turns: unknown = JSON.parse(readFileSync(join(__dirname, 'ai-eval-turns.json'), 'utf8'));
  if (!Array.isArray(turns) || turns.length !== 50 || !turns.every(t => typeof t === 'string')) {
    throw new Error('Expected 50 turns');
  }
  const counts = {
    refusal: 0,
    invalid: 0,
    error: 0,
    timeout: 0,
  };
  let failedTurns = 0, costMicros = 0, latencyMs = 0, unknownUsage = 0;
  for (const [index, text] of turns.entries()) {
    const start = Date.now();
    const deadline = start + 30000;
    const role = index % 2 ? 'mother' : 'father';
    const card = {
      role,
      character: 'Упрямый язвительный родитель, требует конкретных результатов и не любит признавать свои ошибки.',
      weakSpots: [
        {
          key: 'double_standard',
          description: 'Требует от ребёнка того, чего не делает сам.',
        },
        {
          key: 'broken_promise',
          description: 'Не выполняет собственные обещания.',
        },
        {
          key: 'control',
          description: 'Подменяет заботу тотальным контролем.',
        },
        {
          key: 'comparison',
          description: 'Сравнивает с другими, но не терпит сравнений себя.',
        },
        {
          key: 'recognition',
          description: 'Не признаёт доказанные достижения ребёнка.',
        },
      ],
    };
    const context = [{
      author: 'character',
      text: 'Опять одни обещания, где результат?',
    }];
    let failed = false;
    let judge: Judge | undefined;
    // Both calls are exercised for every input, even if the judge failed.
    for (const purpose of ['judge', 'actor']) {
      const defeat = index * 2;
      const input = purpose === 'judge'
        ? {
            text,
            card,
            context,
          }
        : {
            text,
            card,
            context,
            role,
            gender: index % 4 < 2 ? 'male' : 'female',
            mode: battleMode(defeat),
            defeat,
            defeatLevel: defeat < 20 ? 1 : defeat < 50 ? 2 : defeat < 80 ? 3 : 4,
            admitPart: !!judge && judge.corner && judge.logic >= 7,
            recovery: index % 10 === 0,
            summary: '',
          };
      try {
        const result = await provider.call(purpose, input, Math.max(1, deadline - Date.now()));
        if (result.costMicros === undefined) {
          unknownUsage++;
        } else {
          costMicros += result.costMicros;
        }
        if (purpose === 'judge') {
          judge = result.value as Judge;
        }
      } catch (error) {
        const failure = error instanceof AiProviderFailure ? error : new AiProviderFailure('error');
        counts[failure.outcome]++;
        failed = true;
        if (failure.usage?.costMicros === undefined) {
          unknownUsage++;
        } else {
          costMicros += failure.usage.costMicros;
        }
      }
    }
    failedTurns += Number(failed);
    latencyMs += Date.now() - start;
    const damage = judge
      ? battleDamage(judge, {
        base: 1,
        damage: 1.4,
        weakSpot: 3,
        crit: 1.5,
      }).damage
      : undefined;
    console.log(JSON.stringify({
      turn: index + 1,
      failed,
      latencyMs: Date.now() - start,
      damage,
    }));
  }
  const failureRate = failedTurns / turns.length;
  console.log(JSON.stringify({
    turns: turns.length,
    calls: turns.length * 2,
    failedTurns,
    failureRate,
    outcomes: counts,
    outcomeRatesPerCall: {
      refusal: counts.refusal / (turns.length * 2),
      invalid: counts.invalid / (turns.length * 2),
      error: counts.error / (turns.length * 2),
      timeout: counts.timeout / (turns.length * 2),
    },
    averageTurnUsd: costMicros / 1e6 / turns.length,
    callsWithoutUsage: unknownUsage,
    costComplete: unknownUsage === 0,
    averageTurnLatencyMs: latencyMs / turns.length,
    passed: failureRate <= 0.1,
  }, null, 2));
  process.exitCode = failureRate > 0.1 ? 1 : 0;
}
void main().catch(() => {
  console.error('Не удалось выполнить ai:eval: проверьте конфигурацию и файл 50 реплик.');
  process.exitCode = 1;
});
