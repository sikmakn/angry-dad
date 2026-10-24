import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
export class ListOwnerSupportTicketsQueryDto {
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

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['open', 'resolved'])
  status?: 'open' | 'resolved';
}
