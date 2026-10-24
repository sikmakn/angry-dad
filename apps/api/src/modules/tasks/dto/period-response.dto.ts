import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Allow, IsString, IsISO8601, ValidateIf, IsIn, IsBoolean, IsNumber, IsDivisibleBy } from 'class-validator';
import type { PeriodStatusDto } from '../../tasks/dto/period-status.dto';
import type { PeriodClosedByDto } from '../../tasks/dto/period-closed-by.dto';
import { FeedMessageResponseDto } from '../../delivery/dto/feed-message-response.dto';
export class PeriodResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  startsAt!: string;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  moodFrom!: string;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  deadline!: string;

  @ApiProperty({
    required: false,
    description: 'Ориентир повторяющейся задачи',
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  anchorAt?: string;

  @ApiProperty({
    required: true,
    enum: ['active', 'done', 'failed'],
  })
  @IsDefined()
  @IsIn(['active', 'done', 'failed'])
  status!: PeriodStatusDto;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  closedAt?: string;

  @ApiProperty({
    required: false,
    enum: ['done_button', 'check_in', 'deadline', 'give_up'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['done_button', 'check_in', 'deadline', 'give_up'])
  closedBy?: PeriodClosedByDto;

  @ApiProperty({
    required: true,
    description: '«Сделаю за час» уже использовано',
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  retryUsed!: boolean;

  @ApiProperty({
    required: false,
    description: 'Изменение уважения за закрытие периода (с учётом потолков). Есть только у закрытого периода.',
    multipleOf: 0.5,
    type: Number,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsNumber()
  @IsDivisibleBy(0.5)
  respectDelta?: number;

  @ApiProperty({
    required: false,
    description: 'Отправленное сообщение персонажа; `text` — снимок после подстановки, старые сообщения не\nменяются. Оцениваются категории on_reminder, on_check_in, on_check_in_missed, on_fail,\non_absent; без `rating` оценка ещё не поставлена.\n',
    type: () => FeedMessageResponseDto,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  failMessage?: FeedMessageResponseDto;
}
