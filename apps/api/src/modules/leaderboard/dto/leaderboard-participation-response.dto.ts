import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsBoolean } from 'class-validator';
export class LeaderboardParticipationResponseDto {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  inLeaderboard!: boolean;
}
