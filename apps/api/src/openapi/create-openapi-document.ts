import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject, OperationObject, ParameterObject, ResponseObject } from '@nestjs/swagger';
import { ProblemDto } from './problem.dto';
import { operationDescriptions } from './operation-descriptions';

const errorDescriptions: Readonly<Record<string, string>> = {
  400: 'Неверный запрос: validation_failed, task_vague, deadline_out_of_range. Ошибки валидации могут содержать errors; task_vague — reply.',
  401: 'Нет или не годятся данные Telegram: unauthorized либо init_data_expired. Получите свежие данные запуска.',
  403: 'Нет прав: onboarding_required для гостя, owner_only для не-владельца.',
  404: 'Ресурс не найден, включая чужой ресурс.',
  409: 'Конфликт состояния: period_not_active, extension_denied, retry_unavailable, already_rated, already_onboarded, last_enabled_phrase, insufficient_strikes, revoke_exceeds_balance, refund_not_allowed, role_mismatch, turn_in_progress, idempotency_key_reused.',
  429: 'Превышен суточный лимит: daily_limit_reached.',
  500: 'internal_error: внутренняя ошибка без раскрытия подробностей.',
  502: 'turn_failed: ход не засчитан, удар возвращается.',
  503: 'Временная недоступность: ai_unavailable, share_failed, payment_gateway_unavailable либо сбой обработки вебхука.',
};

/**
 * Build offline metadata only. The caller MUST set OPENAPI_EXPORT=1 before importing this module.
 * No init/listen, provider construction, database connection or lifecycle jobs are performed.
 * Build with `npm run build -w api` first so the Swagger DTO compiler plugin runs.
 */
export async function createOpenApiDocument(): Promise<OpenAPIObject> {
  if (process.env.OPENAPI_EXPORT !== '1') {
    throw new Error('Offline OpenAPI export requires OPENAPI_EXPORT=1 before importing the generator');
  }
  const { AppModule } = await import('../app.module.js');
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
    abortOnError: false,
  });
  try {
    app.setGlobalPrefix('api');
    const config = new DocumentBuilder()
      .setTitle('angry-dad')
      .setVersion('0.1.0')
      .setDescription('HTTP API Mini App и вебхука «Батя». Источник контракта — реальные NestJS controllers/DTO. Mini App передаёт Authorization: tma <initData>. Неизвестный Telegram ID создаёт гостя. Операции с завершённым стартом дают гостю 403 onboarding_required. /owner требует совпадения Telegram ID с настроенным ownerId, иначе 403 owner_only. reply — готовый текст персонажа; null означает молчание.')
      .addServer('/api')
      .addApiKey({
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'tma <initData> — подписанные данные запуска Telegram Mini App, не Bearer/JWT. Подпись и auth_date проверяются при каждом запросе. Максимальный возраст настраивается; по умолчанию 3600 секунд (1 час). /owner дополнительно требует Telegram ID = ownerId из конфигурации.',
      }, 'telegramInitData')
      .addApiKey({
        type: 'apiKey',
        in: 'header',
        name: 'X-Telegram-Bot-Api-Secret-Token',
        description: 'Секрет, заданный при регистрации вебхука Telegram; initData для вебхука не требуется.',
      }, 'telegramWebhookSecret')
      .addSecurityRequirements('telegramInitData')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
      extraModels: [ProblemDto],
    });
    for (const [path, item] of Object.entries(document.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const) {
        const operation = item[method];
        if (operation) {
          enrichOperation(operation, path);
        }
      }
    }
    return normalizeSchemaNames(document);
  } finally {
    // Preview closes without executing hooks of ordinary application modules.
    await app.close();
  }
}

function enrichOperation(operation: OperationObject, path: string): void {
  const description = operation.operationId && operationDescriptions[operation.operationId];
  if (description) {
    operation.description = description;
  }
  if (path.startsWith('/owner/')) {
    operation.description = `${operation.description ?? ''}\nТребует Telegram ID = настроенный ownerId.`.trim();
  }
  const parameters = (operation.parameters ?? []).filter((parameter): parameter is ParameterObject => !('$ref' in parameter));
  for (const parameter of parameters) {
    if (parameter.in === 'path') {
      parameter.required = true;
    }
    if (parameter.in === 'query' && parameter.name === 'limit' && parameter.schema && !('$ref' in parameter.schema)) {
      parameter.description ??= 'Размер страницы, по умолчанию 50, максимум 100.';
      parameter.schema.default ??= 50;
    }
    if (parameter.in === 'query' && parameter.name === 'cursor') {
      parameter.description ??= 'Непрозрачный nextCursor предыдущей страницы.';
    }
  }
  // ValidationPipe and path/query/header DTOs can reject input before the controller runs.
  if (operation.requestBody || parameters.length) {
    operation.responses['400'] ??= { description: errorDescriptions['400'] };
  }
  operation.responses['500'] ??= { description: errorDescriptions['500'] };
  for (const [status, response] of Object.entries(operation.responses)) {
    if (!response || '$ref' in response) {
      continue;
    }
    if (status === '204') {
      delete response.content;
    } else if (Number(status) >= 400) {
      enrichErrorResponse(response, status);
    }
  }
}

function enrichErrorResponse(response: ResponseObject, status: string): void {
  const commonDescription = errorDescriptions[status];
  if (commonDescription && response.description !== commonDescription) {
    response.description = `${response.description}. ${commonDescription}`;
  }
  response.content = {
    'application/problem+json': {
      schema: { $ref: '#/components/schemas/Problem' },
      examples: problemExamples[status],
    },
  };
}

const problemExamples: Record<string, Record<string, { value: Record<string, unknown> }>> = {
  400: {
    validation: problemExample('validation_failed', 400, {
      errors: [{
        field: 'timeZone',
        message: 'timeZone must be a valid IANA time zone',
      }],
    }),
    vague: problemExample('task_vague', 400, { reply: 'Это что за задача? Конкретно.' }),
  },
  409: {
    closed: problemExample('period_not_active', 409, { periodStatus: 'failed' }),
    noStrikes: problemExample('insufficient_strikes', 409),
  },
  502: { failed: problemExample('turn_failed', 502, { detail: 'Strike refunded' }) },
};

function problemExample(code: string, status: number, extra: Record<string, unknown> = {}): { value: Record<string, unknown> } {
  return {
    value: {
      type: `urn:angry-dad:problem:${code}`,
      title: code.replaceAll('_', ' '),
      status,
      ...extra,
    },
  };
}

function normalizeSchemaNames(document: OpenAPIObject): OpenAPIObject {
  const schemas = document.components?.schemas ?? {};
  const names = new Map<string, string>();
  const used = new Set<string>();
  for (const name of Object.keys(schemas)) {
    const normalized = name.endsWith('Dto') ? name.slice(0, -3) : name;
    if (used.has(normalized)) {
      throw new Error(`OpenAPI schema name collision: ${normalized}`);
    }
    used.add(normalized);
    names.set(name, normalized);
  }
  document.components ??= {};
  document.components.schemas = Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [names.get(name)!, schema]));
  // JSON round-trip also removes undefined values: callers receive the serializable contract.
  return JSON.parse(JSON.stringify(document, (key: string, value: unknown): unknown => {
    if (key === '$ref' && typeof value === 'string' && value.startsWith('#/components/schemas/')) {
      const name = value.slice('#/components/schemas/'.length);
      return `#/components/schemas/${names.get(name) ?? name}`;
    }
    return value;
  })) as OpenAPIObject;
}
