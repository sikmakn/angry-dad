import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
import { ownerActionTypes } from '../analytics.types';
import type { OwnerActionTypeDto } from './owner-action-type.dto';
export class ListOwnerJournalQueryDto {
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
    required: false,
    enum: [...ownerActionTypes],
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(ownerActionTypes)
  action?: OwnerActionTypeDto;
}
