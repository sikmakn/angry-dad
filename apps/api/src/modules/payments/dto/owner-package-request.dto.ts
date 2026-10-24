import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, IsBoolean } from 'class-validator';
export class OwnerPackageRequestDto {
  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  strikes!: number;

  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  priceStars!: number;

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  active!: boolean;

  @ApiProperty({
    required: true,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  order!: number;
}
