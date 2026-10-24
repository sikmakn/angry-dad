import { IsString, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class GetOwnerMetricsQueryDto {
  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  @IsString()
  @IsISO8601()
  from!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  @IsString()
  @IsISO8601()
  to!: string;
}
