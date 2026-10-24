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
    return this.config.getOrThrow<string>('AI_API_URL');
  }

  get aiKey(): string {
    return this.config.getOrThrow<string>('AI_API_KEY');
  }

  aiModel(purpose: string): string {
    return this.config.get<string>(`AI_MODEL_${purpose.toUpperCase()}`)?.trim() || this.config.get<string>('AI_MODEL')?.trim() || this.config.get<string>(`AI_${this.aiTier(purpose)}_MODEL`)?.trim() || (this.aiTier(purpose) === 'SMART' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001');
  }

  aiRates(purpose: string): {
    input: number;
    output: number;
  } {
    const tier = this.aiTier(purpose);
    return {
      input: this.money(`AI_${tier}_INPUT_USD_PER_MILLION`, tier === 'SMART' ? 3 : 1),
      output: this.money(`AI_${tier}_OUTPUT_USD_PER_MILLION`, tier === 'SMART' ? 15 : 5),
    };
  }

  get starsUsdPerStar(): number {
    return this.money('STARS_USD_PER_STAR', 0.013, true);
  }

  private aiTier(purpose: string): 'SMART' | 'FAST' {
    return ['judge', 'actor'].includes(purpose) ? 'SMART' : 'FAST';
  }

  private money(key: string, fallback: number, positive = false): number {
    const raw = this.config.get<string>(key);
    const value = raw === undefined ? fallback : Number(raw);
    if ((raw !== undefined && !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
      throw new Error(`Invalid monetary configuration: ${key}`);
    }
    return value;
  }
}
