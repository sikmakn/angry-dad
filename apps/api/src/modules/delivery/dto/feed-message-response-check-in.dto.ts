import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsISO8601, IsNumber, IsBoolean } from 'class-validator';
import type { CheckInAnswerDto } from '../../tasks/dto/check-in-answer.dto';
export class FeedMessageResponseCheckInDto {
  @ApiProperty({
    required: false,
    enum: ['done', 'partial', 'not_started'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['done', 'partial', 'not_started'])
  answer?: CheckInAnswerDto;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  answeredAt?: string;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  missedAt?: string;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
    description: 'Закрыто без оценки: пользователь ответил на другую проверку этой задачи.',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  resolvedAt?: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Фактическое изменение уважения за молчание 15 минут. Ноль означает отсутствие списания.',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsNumber()
  respectDelta?: number;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsBoolean()
  expired?: boolean;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Списание всей группы, только на верхней карточке.',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsNumber()
  groupRespectDelta?: number;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsISO8601()
  answerDueAt?: string;
}
