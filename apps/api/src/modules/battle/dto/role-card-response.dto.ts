import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsIn, IsString, IsArray, ValidateNested } from 'class-validator';
import type { RoleDto } from '../../users/dto/role.dto';
import { WeakSpotDto } from '../../battle/dto/weak-spot.dto';
export class RoleCardResponseDto {
  @ApiProperty({
    required: true,
    description: 'Вредный родитель',
    enum: ['father', 'mother'],
  })
  @IsDefined()
  @IsIn(['father', 'mother'])
  role!: RoleDto;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  character!: string;

  @ApiProperty({
    required: true,
    type: () => [WeakSpotDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeakSpotDto)
  weakSpots!: (WeakSpotDto)[];
}
