import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, IsInt, Min, IsString, IsISO8601 } from 'class-validator';
import type { StrikeLotSourceDto } from '../../strikes/dto/strike-lot-source.dto';
export class StrikeLotResponseDto {
  @ApiProperty({
    required: true,
    enum: ['purchase', 'manual'],
  })
  @IsDefined()
  @IsIn(['purchase', 'manual'])
  source!: StrikeLotSourceDto;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  total!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  remaining!: number;

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
