import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, IsBoolean, IsNumber, Min, Max, IsString, IsISO8601 } from 'class-validator';
import type { RoleDto } from '../../users/dto/role.dto';
import type { BattleModeDto } from '../../battle/dto/battle-mode.dto';
export class BattleDialogResponseDto {
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
    enum: ['aggression', 'defense', 'confusion', 'softening'],
  })
  @IsDefined()
  @IsIn(['aggression', 'defense', 'confusion', 'softening'])
  mode!: BattleModeDto;

  @ApiProperty({
    required: true,
    description: 'Ход этого диалога идёт сейчас; кнопка отправки неактивна',
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  turnInProgress!: boolean;

  @ApiProperty({
    required: true,
    description: 'Побеждённость на момент запроса, с учётом отката',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  defeat!: number;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  defeatAt!: string;
}
