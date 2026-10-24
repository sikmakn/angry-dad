import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, IsIn, ValidateIf, ValidateNested, Matches, IsISO8601 } from 'class-validator';
import type { TaskKindDto } from '../../tasks/dto/task-kind.dto';
import type { TaskSizeDto } from '../../tasks/dto/task-size.dto';
import { RecurrenceDto } from '../../tasks/dto/recurrence.dto';
import type { TaskStatusDto } from '../../tasks/dto/task-status.dto';
import { PeriodResponseDto } from '../../tasks/dto/period-response.dto';
export class TaskResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  title!: string;

  @ApiProperty({
    required: true,
    enum: ['one_time', 'recurring'],
  })
  @IsDefined()
  @IsIn(['one_time', 'recurring'])
  kind!: TaskKindDto;

  @ApiProperty({
    required: true,
    description: 'Размер определяет лёгкая модель при постановке; награда за закрытие +1, +3, +5 уважения',
    enum: ['micro', 'medium', 'large'],
  })
  @IsDefined()
  @IsIn(['micro', 'medium', 'large'])
  size!: TaskSizeDto;

  @ApiProperty({
    required: false,
    description: '`daily` — каждый день; `weekdays` — по будням; `weekly` — раз в неделю (`days` из одного\nдня недели или без `days` — календарная неделя); `days_of_week` — выбранные дни (`days`\nот 1 до 6 значений); `every_n_days` — окно из `n` дней (от 2 до 30).\n',
    type: () => RecurrenceDto,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;

  @ApiProperty({
    required: false,
    description: 'Ориентир, время суток ЧЧ:ММ в поясе пользователя',
    pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @Matches(new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]$'))
  anchorTime?: string;

  @ApiProperty({
    required: true,
    enum: ['active', 'stopped', 'closed'],
  })
  @IsDefined()
  @IsIn(['active', 'stopped', 'closed'])
  status!: TaskStatusDto;

  @ApiProperty({
    required: false,
    description: 'Один срок задачи. Настроение клиент считает сам: от `moodFrom` до `anchorAt` (если есть,\nиначе до `deadline`): до 25% — neutral, до 60% — watching, до 85% — annoyed, до 100% —\nangry; после этого срока и после `deadline` — very_angry.\n',
    type: () => PeriodResponseDto,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @ValidateNested()
  @Type(() => PeriodResponseDto)
  currentPeriod?: PeriodResponseDto;

  @ApiProperty({
    required: false,
    description: 'Начало следующего периода. Есть у активной повторяющейся задачи, когда активного\nпериода сейчас нет (например «по будням» в субботу): тогда `currentPeriod` — последний\nзакрытый период. Вычисляется сервером по правилам периодов.\n',
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  nextPeriodStartsAt?: string;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  createdAt!: string;
}
