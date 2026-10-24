import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Allow, ValidateIf, IsInt, Min, IsBoolean } from 'class-validator';
export class LeaderboardMeDto {
  @ApiProperty({
    required: false,
    description: 'Место; `null`, если пользователь вышел из рейтинга',
    type: 'integer',
    nullable: true,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @Allow()
  rank?: number | null;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  closedCount!: number;

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  inLeaderboard!: boolean;
}
