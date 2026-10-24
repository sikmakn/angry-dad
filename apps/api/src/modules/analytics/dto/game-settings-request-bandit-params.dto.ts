import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, IsNumber, Max } from 'class-validator';
export class GameSettingsRequestBanditParamsDto {
  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  trialShows!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    maximum: 2,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(2)
  disableAvg!: number;

  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  disableVotes!: number;
}
