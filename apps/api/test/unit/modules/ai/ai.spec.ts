import type { ClientSession } from 'mongoose';
import { DatabaseService } from '../../../../src/database/database.service';
import { AnalyticsService } from '../../../../src/modules/analytics/analytics.service';
import { AiService } from '../../../../src/modules/ai/ai.service';
import { ConfiguredAiProvider } from '../../../../src/modules/ai/services/ai-provider.service';
import { aiConfig, completion, judgeValue } from '../../../helpers/ai';

describe('AiService judge weak spot validation', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    {
      allowed: ['known-spot'],
      expected: null,
    },
    {
      allowed: [judgeValue.weakSpotHit],
      expected: judgeValue.weakSpotHit,
    },
  ])('returns $expected for allowed keys $allowed after provider validation', async ({ allowed, expected }) => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(completion(JSON.stringify(judgeValue)));
    const config = aiConfig({
      EXTERNAL_CLIENTS_MODE: 'real',
      AI_API_KEY: 'synthetic-key',
    });
    const create = jest.fn().mockResolvedValue([{ toObject: () => ({ _id: 'ai-call-id' }) }]);
    const updateOne = jest.fn().mockResolvedValue({ matchedCount: 1 });
    const db = {
      model: jest.fn().mockReturnValue({
        create,
        updateOne,
      }),
      transaction: async <T>(work: (session: ClientSession) => Promise<T>): Promise<T> => work({} as ClientSession),
    } as unknown as DatabaseService;
    const service = new AiService(db, config, {} as AnalyticsService, new ConfiguredAiProvider(config));

    await expect(service.judge({
      text: 'Аргумент',
      card: {
        weakSpots: allowed.map(key => ({
          key,
          description: 'Описание',
        })),
      },
    }, 'user-id', 'turn-id', allowed, Date.now() + 1000)).resolves.toEqual({
      ...judgeValue,
      weakSpotHit: expected,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(updateOne).toHaveBeenLastCalledWith({ _id: 'ai-call-id' }, { $set: expect.objectContaining({ outcome: 'ok' }) });
  });
});
