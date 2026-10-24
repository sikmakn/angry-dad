import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, ValidateIf, IsArray, ArrayMinSize, ArrayMaxSize, ArrayUnique, IsInt, Min, Max } from 'class-validator';
export class RecurrenceDto {
  @ApiProperty({
    required: true,
    enum: ['daily', 'weekdays', 'weekly', 'days_of_week', 'every_n_days'],
  })
  @IsDefined()
  @IsIn(['daily', 'weekdays', 'weekly', 'days_of_week', 'every_n_days'])
  type!: 'daily' | 'weekdays' | 'weekly' | 'days_of_week' | 'every_n_days';

  @ApiProperty({
    required: false,
    description: 'Дни недели, 1 — понедельник, 7 — воскресенье',
    minItems: 1,
    maxItems: 6,
    uniqueItems: true,
    type: 'array',
    items: {
      type: 'integer',
      minimum: 1,
      maximum: 7,
    },
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ArrayUnique()
  days?: (number)[];

  @ApiProperty({
    required: false,
    minimum: 2,
    maximum: 30,
    type: 'integer',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(2)
  @Max(30)
  n?: number;
}
