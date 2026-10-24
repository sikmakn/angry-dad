import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
export class ListOwnerPaymentsQueryDto {
  @ApiProperty({
    type: 'integer',
    required: false,
    default: 50,
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  cursor?: string;

  @ApiProperty({
    type: 'integer',
    format: 'int64',
    required: false,
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  telegramId?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['invoiced', 'paid', 'credited', 'refunded'])
  status?: 'invoiced' | 'paid' | 'credited' | 'refunded';
}
