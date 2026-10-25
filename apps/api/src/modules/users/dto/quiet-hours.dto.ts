import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, Max } from 'class-validator';
export class QuietHoursDto {
  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 1439,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(1439)
  start!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 1439,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(1439)
  end!: number;
}
