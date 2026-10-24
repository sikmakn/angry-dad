import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested, IsInt, Min, IsArray } from 'class-validator';
import { GameSettingsRequestBattleCoefficientsDto } from '../../analytics/dto/game-settings-request-battle-coefficients.dto';
import { OtherNameDto } from '../../analytics/dto/other-name.dto';
import { GameSettingsRequestBanditParamsDto } from '../../analytics/dto/game-settings-request-bandit-params.dto';
export class GameSettingsResponseDto {
  @ApiProperty({
    required: true,
    type: () => GameSettingsRequestBattleCoefficientsDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GameSettingsRequestBattleCoefficientsDto)
  battleCoefficients!: GameSettingsRequestBattleCoefficientsDto;

  @ApiProperty({
    required: true,
    description: 'Проверок конкретности на пользователя в сутки',
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  aiDailyLimit!: number;

  @ApiProperty({
    required: true,
    type: () => [OtherNameDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherNameDto)
  otherNames!: (OtherNameDto)[];

  @ApiProperty({
    required: true,
    type: () => GameSettingsRequestBanditParamsDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => GameSettingsRequestBanditParamsDto)
  banditParams!: GameSettingsRequestBanditParamsDto;
}
