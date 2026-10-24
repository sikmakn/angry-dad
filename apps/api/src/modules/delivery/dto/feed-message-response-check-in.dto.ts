import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsISO8601 } from 'class-validator';
import type { CheckInAnswerDto } from '../../tasks/dto/check-in-answer.dto';
export class FeedMessageResponseCheckInDto {
  @ApiProperty({
    required: false,
    enum: ['done', 'partial', 'not_started'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['done', 'partial', 'not_started'])
  answer?: CheckInAnswerDto;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  answeredAt?: string;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  missedAt?: string;
}
