import { aiConfig } from '../../helpers/ai';

describe('AI model, endpoint and pricing configuration', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['specificity', 'judge', 'actor', 'summary', 'paraphrase'])('defaults %s to gpt-oss on Groq with zero rates', (purpose) => {
    const config = aiConfig();
    expect(config.aiModel(purpose)).toBe('openai/gpt-oss-120b');
    expect(config.aiUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(config.aiRates(purpose)).toEqual({
      input: 0,
      output: 0,
    });
  });

  it('uses the global model and gives the actor override precedence', () => {
    const config = aiConfig({
      AI_MODEL: ' grok-4.3 ',
      AI_MODEL_ACTOR: ' grok-4.7 ',
    });
    expect(config.aiModel('actor')).toBe('grok-4.7');
    for (const purpose of ['specificity', 'judge', 'summary', 'paraphrase']) {
      expect(config.aiModel(purpose)).toBe('grok-4.3');
    }
  });

  it('trims a configured endpoint', () => {
    expect(aiConfig({ AI_API_URL: ' https://example.invalid/chat ' }).aiUrl).toBe('https://example.invalid/chat');
  });

  it.each(['', '   '])('uses defaults for blank model/endpoint settings %j', (blank) => {
    const config = aiConfig({
      AI_MODEL: blank,
      AI_MODEL_ACTOR: blank,
      AI_API_URL: blank,
    });
    expect(config.aiModel('actor')).toBe('openai/gpt-oss-120b');
    expect(config.aiUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(aiConfig({
      AI_MODEL: 'grok-4.3',
      AI_MODEL_ACTOR: blank,
    }).aiModel('actor')).toBe('grok-4.3');
  });

  it.each([
    {
      model: 'grok-4.3',
      input: 1.25,
      output: 2.5,
    },
    {
      model: 'grok-4.7',
      input: 2,
      output: 6,
    },
    {
      model: 'grok-4.7-fast',
      input: 2,
      output: 6,
    },
    {
      model: 'openai/gpt-oss-120b',
      input: 0,
      output: 0,
    },
    {
      model: 'another-model',
      input: 0,
      output: 0,
    },
  ])('uses default prices for $model', ({ model, input, output }) => {
    expect(aiConfig({ AI_MODEL: model }).aiRates('actor')).toEqual({
      input,
      output,
    });
  });

  it.each([
    {
      model: 'grok-4.3',
      prefix: 'GROK_4_3',
    },
    {
      model: 'grok-4.7',
      prefix: 'GROK_4_7',
    },
  ])('supports model prices and per-purpose precedence for $model', ({ model, prefix }) => {
    const config = aiConfig({
      AI_MODEL: model,
      [`AI_${prefix}_INPUT_USD_PER_MILLION`]: '3.25',
      [`AI_${prefix}_OUTPUT_USD_PER_MILLION`]: '7.5',
      AI_ACTOR_INPUT_USD_PER_MILLION: '0',
      AI_ACTOR_OUTPUT_USD_PER_MILLION: '0.75',
    });
    expect(config.aiRates('actor')).toEqual({
      input: 0,
      output: 0.75,
    });
    expect(config.aiRates('judge')).toEqual({
      input: 3.25,
      output: 7.5,
    });
  });

  it('chooses prices by the per-purpose model', () => {
    const config = aiConfig({
      AI_MODEL: 'grok-4.3',
      AI_MODEL_ACTOR: 'grok-4.7',
    });
    expect(config.aiRates('actor')).toEqual({
      input: 2,
      output: 6,
    });
    expect(config.aiRates('judge')).toEqual({
      input: 1.25,
      output: 2.5,
    });
  });

  it('allows explicit prices for a non-Grok model', () => {
    const config = aiConfig({
      AI_MODEL: 'another-model',
      AI_ACTOR_INPUT_USD_PER_MILLION: '0.1',
      AI_ACTOR_OUTPUT_USD_PER_MILLION: '0.2',
    });
    expect(config.aiRates('actor')).toEqual({
      input: 0.1,
      output: 0.2,
    });
    expect(config.aiRates('judge')).toEqual({
      input: 0,
      output: 0,
    });
  });

  it('falls back when price variables are empty', () => {
    expect(aiConfig({
      AI_MODEL: 'grok-4.7',
      AI_GROK_4_7_INPUT_USD_PER_MILLION: '',
      AI_ACTOR_OUTPUT_USD_PER_MILLION: '',
    }).aiRates('actor')).toEqual({
      input: 2,
      output: 6,
    });
  });

  it.each(['-1', 'NaN', 'Infinity', '1e3', ' '])('rejects invalid monetary setting %j', (price) => {
    expect(() => aiConfig({ AI_ACTOR_INPUT_USD_PER_MILLION: price }).aiRates('actor')).toThrow('Invalid monetary configuration: AI_ACTOR_INPUT_USD_PER_MILLION');
  });
});
