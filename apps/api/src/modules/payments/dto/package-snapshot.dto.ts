import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt } from 'class-validator';
export class PackageSnapshotDto {
  @ApiProperty({
    required: true,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  strikes!: number;

  @ApiProperty({
    required: true,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  priceStars!: number;
}
