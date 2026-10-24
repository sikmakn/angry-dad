import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Allow, IsString, IsISO8601, ValidateIf } from 'class-validator';
export class MetricsResponseDto {
  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  from!: string;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  to!: string;

  @ApiProperty({
    required: false,
    description: 'Возврат на 7-й день',
    minimum: 0,
    maximum: 1,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  day7Retention?: number | null;

  @ApiProperty({
    required: false,
    description: 'Доля закрытых задач и периодов',
    minimum: 0,
    maximum: 1,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  closedShare?: number | null;

  @ApiProperty({
    required: false,
    description: 'Доля отвеченных проверок',
    minimum: 0,
    maximum: 1,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  checkInAnswerRate?: number | null;

  @ApiProperty({
    required: false,
    description: 'Конверсия в первую покупку',
    minimum: 0,
    maximum: 1,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  firstPurchaseConversion?: number | null;

  @ApiProperty({
    required: false,
    description: 'Расходы ИИ платных попыток к стоимости израсходованных платных ударов, в USD',
    minimum: 0,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  turnCostToStrikeRevenue?: number | null;

  @ApiProperty({
    required: false,
    description: 'Доля заблокировавших бота',
    minimum: 0,
    maximum: 1,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  botBlockedShare?: number | null;

  @ApiProperty({
    required: false,
    description: 'Средний балл фраз',
    minimum: 0,
    maximum: 2,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  avgPhraseScore?: number | null;

  @ApiProperty({
    required: false,
    description: 'Пересылок карточки на 100 активных пользователей',
    minimum: 0,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  sharesPer100Active?: number | null;

  @ApiProperty({
    required: false,
    description: 'Медиана времени от /start до первой сохранённой задачи',
    minimum: 0,
    type: Number,
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  medianStartToFirstTaskSeconds?: number | null;
}
