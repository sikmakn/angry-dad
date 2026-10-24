import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { StrikeLotResponseDto } from '../../strikes/dto/strike-lot-response.dto';
export class StrikeBalanceResponseDto {
  @ApiProperty({
    required: true,
    description: 'Сумма остатков партий',
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  balance!: number;

  @ApiProperty({
    required: true,
    description: 'Партии от старых к новым, расход идёт из самой ранней с остатком',
    type: () => [StrikeLotResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrikeLotResponseDto)
  lots!: (StrikeLotResponseDto)[];
}
