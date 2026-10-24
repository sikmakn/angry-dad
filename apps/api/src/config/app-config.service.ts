import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) { }
  get port(): number {
    return Number(this.config.get<string>('PORT') ?? 3000);
  }

  get mongoUri(): string {
    return this.config.getOrThrow<string>('MONGODB_URI');
  }

  get botToken(): string {
    return this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  get webhookSecret(): string {
    return this.config.getOrThrow<string>('TELEGRAM_WEBHOOK_SECRET');
  }

  get ownerId(): number {
    return Number(this.config.getOrThrow<string>('OWNER_TELEGRAM_ID'));
  }

  get authMaxAge(): number {
    return Number(this.config.get<string>('TELEGRAM_AUTH_MAX_AGE_SECONDS') ?? 3600);
  }

  get deletionSalt(): string {
    return this.config.getOrThrow<string>('DELETION_HASH_SALT');
  }

  get testClients(): boolean {
    return this.config.get<string>('EXTERNAL_CLIENTS_MODE') === 'test';
  }

  get miniAppUrl(): string {
    return this.config.getOrThrow<string>('MINI_APP_URL');
  }

  get botUrl(): string {
    return this.config.getOrThrow<string>('BOT_URL');
  }

  get aiUrl(): string {
    return this.config.get<string>('AI_API_URL')?.trim() || 'https://api.groq.com/openai/v1/chat/completions';
  }

  get aiKey(): string {
    return this.config.getOrThrow<string>('AI_API_KEY');
  }

  aiModel(purpose: string): string {
    return this.config.get<string>(`AI_MODEL_${purpose.toUpperCase()}`)?.trim() || this.config.get<string>('AI_MODEL')?.trim() || 'openai/gpt-oss-120b';
  }

  aiRates(purpose: string): {
    input: number;
    output: number;
  } {
    const model = this.aiModel(purpose);
    const grok = /^grok-/.test(model);
    const expensive = /^grok-4\.7(?:$|-)/.test(model);
    const modelKey = expensive ? 'GROK_4_7' : 'GROK_4_3';
    return {
      input: this.money(`AI_${purpose.toUpperCase()}_INPUT_USD_PER_MILLION`, this.money(`AI_${modelKey}_INPUT_USD_PER_MILLION`, grok ? expensive ? 2 : 1.25 : 0)),
      output: this.money(`AI_${purpose.toUpperCase()}_OUTPUT_USD_PER_MILLION`, this.money(`AI_${modelKey}_OUTPUT_USD_PER_MILLION`, grok ? expensive ? 6 : 2.5 : 0)),
    };
  }

  get starsUsdPerStar(): number {
    return this.money('STARS_USD_PER_STAR', 0.013, true);
  }

  private money(key: string, fallback: number, positive = false): number {
    const raw = this.config.get<string>(key);
    const value = raw === undefined || raw === '' ? fallback : Number(raw);
    if ((raw !== undefined && raw !== '' && !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
      throw new Error(`Invalid monetary configuration: ${key}`);
    }
    return value;
  }
}
