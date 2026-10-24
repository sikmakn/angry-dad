import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsBoolean } from 'class-validator';
export class LeaderboardParticipationRequestDto {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  inLeaderboard!: boolean;
}
