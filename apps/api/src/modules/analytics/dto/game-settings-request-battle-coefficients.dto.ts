import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber } from 'class-validator';
export class GameSettingsRequestBattleCoefficientsDto {
  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  base!: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  damage!: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  weakSpot!: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  crit!: number;
}
