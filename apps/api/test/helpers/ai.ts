import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../src/config/app-config.service';

// Read only explicit test values, never process.env or an env file.
export function aiConfig(values: Record<string, string> = {}): AppConfigService {
  const config = new ConfigService();
  jest.spyOn(config, 'get').mockImplementation((key: string) => values[key]);
  return new AppConfigService(config);
}

export const judgeValue = {
  hit: 0,
  logic: 10,
  originality: 5,
  corner: false,
  weakSpotHit: 'unknown—spot–key',
};

export function completion(content: string, finishReason = 'stop', message: Record<string, unknown> = {}): Response {
  return Response.json({
    choices: [{
      finish_reason: finishReason,
      message: {
        role: 'assistant',
        content,
        ...message,
      },
    }],
  });
}
