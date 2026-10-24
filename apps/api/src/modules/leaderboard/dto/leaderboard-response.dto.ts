import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsArray, ArrayMaxSize, ValidateNested } from 'class-validator';
import { LeaderboardEntryDto } from '../../leaderboard/dto/leaderboard-entry.dto';
import { LeaderboardMeDto } from '../../leaderboard/dto/leaderboard-me.dto';
export class LeaderboardResponseDto {
  @ApiProperty({
    required: true,
    maxItems: 100,
    type: () => [LeaderboardEntryDto],
  })
  @IsDefined()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => LeaderboardEntryDto)
  items!: (LeaderboardEntryDto)[];

  @ApiProperty({
    required: true,
    type: () => LeaderboardMeDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LeaderboardMeDto)
  me!: LeaderboardMeDto;
}
