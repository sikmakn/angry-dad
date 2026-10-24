import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { OwnerStrikeLotResponseDto } from '../../strikes/dto/owner-strike-lot-response.dto';
export class OwnerStrikeBalanceResponseDto {
  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  balance!: number;

  @ApiProperty({
    required: true,
    type: () => [OwnerStrikeLotResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OwnerStrikeLotResponseDto)
  lots!: (OwnerStrikeLotResponseDto)[];
}
