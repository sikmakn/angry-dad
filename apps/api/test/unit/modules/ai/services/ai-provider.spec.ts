import { AiProviderFailure, ConfiguredAiProvider } from '../../../../../src/modules/ai/services/ai-provider.service';
import { aiConfig, completion, judgeValue } from '../../../../helpers/ai';

const key = 'synthetic-secret-ai-key';
const purposes = ['specificity', 'judge', 'actor', 'summary', 'paraphrase'] as const;
const values = {
  specificity: {
    specific: true,
    size: 'medium',
  },
  judge: judgeValue,
  actor: 'Докажи делом.',
  summary: 'Игрок обещал написать отчёт.',
  paraphrase: ['Докажи делом.'],
};

describe('ConfiguredAiProvider real HTTP mode', () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let provider: ConfiguredAiProvider;

  beforeEach(() => {
    provider = new ConfiguredAiProvider(aiConfig({
      EXTERNAL_CLIENTS_MODE: 'real',
      AI_API_KEY: key,
      AI_API_URL: 'https://ai.example.invalid/v1/chat/completions',
    }));
    // Every test replaces fetch before calling the provider: no external API traffic.
    fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unconfigured fetch mock'));
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(purposes.flatMap(purpose => ['openai/gpt-oss-120b', 'grok-4.3'].map(model => ({
    purpose,
    model,
  }))))(
    'sends OpenAI messages for $purpose using $model and the configured endpoint/key/model',
    async ({ purpose, model }) => {
      const config = aiConfig({
        EXTERNAL_CLIENTS_MODE: 'real',
        AI_API_KEY: key,
        AI_API_URL: 'https://ai.example.invalid/v1/chat/completions',
        AI_MODEL: 'unused-global-model',
        [`AI_MODEL_${purpose.toUpperCase()}`]: model,
      });
      const value = values[purpose];
      fetchMock.mockResolvedValue(completion(typeof value === 'string' ? value : JSON.stringify(value)));
      await expect(new ConfiguredAiProvider(config).call(purpose, {}, 1000)).resolves.toMatchObject({ value });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(config.aiUrl);
      expect(init).toMatchObject({
        method: 'POST',
        headers: {
          'authorization': `Bearer ${key}`,
          'content-type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      });
      const body = JSON.parse(String(init?.body));
      expect(body).toEqual({
        model,
        messages: [{
          role: 'system',
          content: expect.any(String),
        }, {
          role: 'user',
          content: expect.any(String),
        }],
        max_tokens: 2000,
        stream: false,
        ...(model.includes('gpt-oss') ? { reasoning_effort: 'low' } : {}),
      });
      expect(() => JSON.parse(body.messages[1].content)).not.toThrow();
    },
  );

  async function expectFailure(outcome: AiProviderFailure['outcome'], purpose = 'specificity'): Promise<void> {
    const error: unknown = await provider.call(purpose, {}, 1000).catch((error: unknown) => error);
    expect(error).toBeInstanceOf(AiProviderFailure);
    expect(error).toMatchObject({
      outcome,
      message: `AI ${outcome}`,
    });
    expect(String(error)).not.toContain(key);
    expect(JSON.stringify(error)).not.toContain(key);
    expect((error as Error).stack).not.toContain(key);
  }

  it.each(['TimeoutError', 'AbortError'])('classifies %s without leaking the key', async (name) => {
    fetchMock.mockRejectedValue(Object.assign(new Error(key), { name }));
    await expectFailure('timeout');
  });

  it('aborts a stalled fetch when the configured deadline expires', async () => {
    fetchMock.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
    }));
    await expect(provider.call('specificity', {}, 10)).rejects.toMatchObject({ outcome: 'timeout' });
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('classifies network errors without leaking the key', async () => {
    fetchMock.mockRejectedValue(new Error(`Failed request Bearer ${key}`));
    await expectFailure('error');
  });

  it.each(['message.refusal', 'content_filter', 'refusal JSON'])('classifies %s as refusal', async (kind) => {
    fetchMock.mockResolvedValue(kind === 'message.refusal'
      ? completion(key, 'stop', { refusal: key })
      : kind === 'content_filter' ? completion(key, 'content_filter') : completion('{"refusal":true}'));
    await expectFailure('refusal');
  });

  it.each([400, 401, 403, 404, 429, 500, 502, 503])('classifies HTTP %i as error and discards its body', async (status) => {
    fetchMock.mockResolvedValue(Response.json({ error: { message: key } }, { status }));
    await expectFailure('error');
  });

  it.each([400, 503])('classifies non-JSON HTTP %i as error', async (status) => {
    fetchMock.mockResolvedValue(new Response(key, { status }));
    await expectFailure('error');
  });

  it('classifies malformed response envelope JSON as invalid', async () => {
    fetchMock.mockResolvedValue(new Response(key));
    await expectFailure('invalid');
  });

  it('classifies malformed model JSON as invalid', async () => {
    fetchMock.mockResolvedValue(completion(key));
    await expectFailure('invalid');
  });

  it('rejects finish_reason length even when the JSON is complete', async () => {
    fetchMock.mockResolvedValue(completion(JSON.stringify(values.specificity), 'length'));
    await expectFailure('invalid');
  });

  it.each([
    {
      purpose: 'specificity',
      value: {
        specific: 'true',
        size: 'medium',
      },
    },
    {
      purpose: 'specificity',
      value: {
        specific: true,
        size: 'giant',
      },
    },
    {
      purpose: 'specificity',
      value: {
        ...values.specificity,
        extra: true,
      },
    },
    {
      purpose: 'judge',
      value: {
        ...judgeValue,
        corner: 'false',
      },
    },
    {
      purpose: 'judge',
      value: {
        ...judgeValue,
        weakSpotHit: 42,
      },
    },
    {
      purpose: 'actor',
      value: '',
    },
    {
      purpose: 'actor',
      value: 'Раз. Два. Три. Четыре.',
    },
    {
      purpose: 'summary',
      value: 'x'.repeat(8001),
    },
    {
      purpose: 'paraphrase',
      value: [],
    },
    {
      purpose: 'paraphrase',
      value: ['текст', 42],
    },
  ])('rejects out-of-schema $purpose value %#', async ({ purpose, value }) => {
    fetchMock.mockResolvedValue(completion(typeof value === 'string' ? value : JSON.stringify(value)));
    await expectFailure('invalid', purpose);
  });

  it.each(['hit', 'logic', 'originality'].flatMap(field => [-1, 11, 1.5].map(score => ({
    field,
    score,
  }))))(
    'rejects judge $field=$score', async ({ field, score }) => {
      fetchMock.mockResolvedValue(completion(JSON.stringify({
        ...judgeValue,
        [field]: score,
      })));
      await expectFailure('invalid', 'judge');
    },
  );

  it.each(['actor', 'summary'])('normalizes both dash variants in %s prose', async (purpose) => {
    fetchMock.mockResolvedValue(completion('Обещал — выполняй – сегодня.'));
    await expect(provider.call(purpose, {}, 1000)).resolves.toMatchObject({ value: 'Обещал - выполняй - сегодня.' });
  });

  it('normalizes each paraphrase string while preserving variables', async () => {
    fetchMock.mockResolvedValue(completion(JSON.stringify(['{name} — докажи.', 'Ты – обещал.', 'Без тире.'])));
    await expect(provider.call('paraphrase', {}, 1000)).resolves.toMatchObject({ value: ['{name} - докажи.', 'Ты - обещал.', 'Без тире.'] });
  });

  it('preserves specificity JSON types and values', async () => {
    fetchMock.mockResolvedValue(completion(JSON.stringify(values.specificity)));
    expect((await provider.call('specificity', {}, 1000)).value).toEqual(values.specificity);
  });

  it('accepts an unknown judge weakSpotHit and preserves its dashes and score boundaries', async () => {
    fetchMock.mockResolvedValue(completion(JSON.stringify(judgeValue)));
    expect((await provider.call('judge', { card: { weakSpots: [{ key: 'known' }] } }, 1000)).value).toEqual(judgeValue);
  });
});
