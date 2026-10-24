import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsInt, Min, IsNumber, Max, IsIn, IsDivisibleBy, IsArray, ValidateNested } from 'class-validator';
import type { BattleModeDto } from '../../battle/dto/battle-mode.dto';
import { BattleMessageResponseDto } from '../../battle/dto/battle-message-response.dto';
export class TurnResponseDto {
  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  damage!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  defeatBefore!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  defeatAfter!: number;

  @ApiProperty({
    required: true,
    enum: ['aggression', 'defense', 'confusion', 'softening'],
  })
  @IsDefined()
  @IsIn(['aggression', 'defense', 'confusion', 'softening'])
  mode!: BattleModeDto;

  @ApiProperty({
    required: true,
    description: 'Изменение уважения за ход, включая +12 за слом',
    multipleOf: 0.5,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @IsDivisibleBy(0.5)
  respectDelta!: number;

  @ApiProperty({
    required: true,
    description: 'Уважение после хода',
    minimum: 0,
    maximum: 100,
    multipleOf: 0.5,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsDivisibleBy(0.5)
  respect!: number;

  @ApiProperty({
    required: true,
    description: 'Реплика игрока, ответ персонажа и (при сломе) финальная реплика, по порядку',
    type: () => [BattleMessageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BattleMessageResponseDto)
  messages!: (BattleMessageResponseDto)[];

  @ApiProperty({
    required: true,
    description: 'Баланс ударов после хода',
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  strikesBalance!: number;
}
