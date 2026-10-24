import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, IsInt, Min, ValidateIf, IsString, IsISO8601 } from 'class-validator';
import type { StrikeOperationTypeDto } from '../../strikes/dto/strike-operation-type.dto';
export class StrikeOperationResponseDto {
  @ApiProperty({
    required: true,
    enum: ['purchase', 'spend', 'turn_refund', 'manual_grant', 'manual_revoke', 'stars_refund'],
  })
  @IsDefined()
  @IsIn(['purchase', 'spend', 'turn_refund', 'manual_grant', 'manual_revoke', 'stars_refund'])
  type!: StrikeOperationTypeDto;

  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({
    required: false,
    description: 'Для ручных операций и возвратов; русский текст, который формирует сервер («Возврат: ошибка хода»)',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  reason?: string;

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
