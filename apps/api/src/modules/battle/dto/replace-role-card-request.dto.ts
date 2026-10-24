import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, MinLength, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { WeakSpotDto } from '../../battle/dto/weak-spot.dto';
export class ReplaceRoleCardRequestDto {
  @ApiProperty({
    required: true,
    minLength: 1,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  character!: string;

  @ApiProperty({
    required: true,
    minItems: 5,
    type: () => [WeakSpotDto],
  })
  @IsDefined()
  @IsArray()
  @ArrayMinSize(5)
  @ValidateNested({ each: true })
  @Type(() => WeakSpotDto)
  weakSpots!: (WeakSpotDto)[];
}
