import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';
export class WeakSpotDto {
  @ApiProperty({
    required: true,
    minLength: 1,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  key!: string;

  @ApiProperty({
    required: true,
    minLength: 1,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  description!: string;
}
