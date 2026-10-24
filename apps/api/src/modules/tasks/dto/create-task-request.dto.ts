import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, MinLength, MaxLength, IsIn, ValidateIf, IsISO8601, ValidateNested, Matches } from 'class-validator';
import type { TaskKindDto } from '../../tasks/dto/task-kind.dto';
import { RecurrenceDto } from '../../tasks/dto/recurrence.dto';
export class CreateTaskRequestDto {
  @Transform(({ value }: {
    value: unknown;
  }) => typeof value === 'string' ? value.trim() : value)
  @ApiProperty({
    required: true,
    description: 'После обрезки пробелов по краям',
    minLength: 1,
    maxLength: 120,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    required: true,
    enum: ['one_time', 'recurring'],
  })
  @IsDefined()
  @IsIn(['one_time', 'recurring'])
  kind!: TaskKindDto;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  deadline?: string;

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
    pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @Matches(new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]$'))
  anchorTime?: string;
}
