import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsInt, Min } from 'class-validator';
export class PackageResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

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
    description: 'Цена в Telegram Stars (XTR)',
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  priceStars!: number;
}
