import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min, ValidateIf, IsString } from 'class-validator';
export class LeaderboardEntryDto {
  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  rank!: number;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  username?: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  firstName?: string;

  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  closedCount!: number;
}
