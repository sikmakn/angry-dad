import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, Max, IsDivisibleBy } from 'class-validator';
export class QuietHoursDto {
  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 1410,
    multipleOf: 30,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(1410)
  @IsDivisibleBy(30)
  start!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 1410,
    multipleOf: 30,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(1410)
  @IsDivisibleBy(30)
  end!: number;
}
