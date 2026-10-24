import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, IsIn, IsString, ValidateIf } from 'class-validator';
import type { BattleAuthorDto } from '../../battle/dto/battle-author.dto';
import type { BattleOriginDto } from '../../battle/dto/battle-origin.dto';
export class BattleMessageResponseDto {
  @ApiProperty({
    required: true,
    description: 'Порядковый номер реплики в диалоге',
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  seq!: number;

  @ApiProperty({
    required: true,
    enum: ['player', 'character'],
  })
  @IsDefined()
  @IsIn(['player', 'character'])
  author!: BattleAuthorDto;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  text!: string;

  @ApiProperty({
    required: true,
    enum: ['turn', 'reply_to_feed', 'battle_start', 'break'],
  })
  @IsDefined()
  @IsIn(['turn', 'reply_to_feed', 'battle_start', 'break'])
  origin!: BattleOriginDto;

  @ApiProperty({
    required: false,
    description: 'Название задачи для реплики из «Истории»',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  taskTitle?: string;
}
