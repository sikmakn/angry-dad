import { ApiProperty, ApiSchema } from '@nestjs/swagger';

const problemCodes = [
  'validation_failed', 'unauthorized', 'not_found', 'internal_error',
  'already_onboarded', 'init_data_expired', 'onboarding_required', 'owner_only',
  'deadline_out_of_range', 'extension_denied', 'period_not_active', 'retry_unavailable', 'task_vague',
  'already_rated', 'last_enabled_phrase', 'ai_unavailable', 'daily_limit_reached',
  'idempotency_key_reused', 'role_mismatch', 'turn_failed', 'turn_in_progress',
  'insufficient_strikes', 'revoke_exceeds_balance', 'share_failed',
  'payment_gateway_unavailable', 'refund_not_allowed',
];

@ApiSchema({ name: 'ProblemFieldError' })
export class ProblemFieldErrorDto {
  @ApiProperty({ type: String })
  field!: string;

  @ApiProperty({ type: String })
  message!: string;
}

@ApiSchema({
  name: 'Problem',
  description: 'RFC 9457. title и detail — английские тексты без внутренних подробностей; reply — русская фраза персонажа.',
})
export class ProblemDto {
  @ApiProperty({
    type: String,
    enum: problemCodes.map(code => `urn:angry-dad:problem:${code}`),
    enumName: 'ProblemType',
  })
  type!: string;

  @ApiProperty({ type: String })
  title!: string;

  @ApiProperty({ type: 'integer' })
  status!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  detail?: string;

  @ApiProperty({
    type: [ProblemFieldErrorDto],
    required: false,
    description: 'Ошибки полей для validation_failed, если доступны.',
  })
  errors?: ProblemFieldErrorDto[];

  @ApiProperty({
    type: String,
    required: false,
    description: 'Готовая фраза персонажа, например onVague или onExcuseDenied.',
  })
  reply?: string;

  @ApiProperty({
    required: false,
    enum: ['done', 'failed', 'stopped', 'deleted'],
    description: 'Причина period_not_active; удалённая собственная задача даёт deleted, чужая — 404.',
  })
  periodStatus?: 'done' | 'failed' | 'stopped' | 'deleted';
}
