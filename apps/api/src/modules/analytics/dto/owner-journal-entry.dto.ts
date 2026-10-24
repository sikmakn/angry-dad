import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Allow, IsIn, ValidateIf, IsInt, IsString, IsISO8601 } from 'class-validator';
import type { OwnerActionTypeDto } from '../../analytics/dto/owner-action-type.dto';
import { ownerActionTypes } from '../analytics.types';
export class OwnerJournalEntryDto {
  @ApiProperty({
    required: true,
    enum: [...ownerActionTypes],
  })
  @IsDefined()
  @IsIn(ownerActionTypes)
  action!: OwnerActionTypeDto;

  @ApiProperty({
    required: false,
    description: 'Пользователь, над которым совершено действие',
    format: 'int64',
    type: 'integer',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  targetTelegramId?: number;

  @ApiProperty({
    required: false,
    description: 'Идентификатор объекта действия: фраза, пакет, платёж, роль или обращение. Для paraphrase_generate — исходная фраза, для support_ticket_status_changed — обращение.',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  targetId?: string;

  @ApiProperty({
    required: false,
    description: 'Числа и причина. Для paraphrase_generate: count — число сохранённых вариантов, generatedIds — их ID; для support_ticket_status_changed: from и to — прежний и новый статусы. Тексты фраз и обращений не включаются.',
    type: Object,
    additionalProperties: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  details?: Record<string, unknown>;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  at!: string;
}
