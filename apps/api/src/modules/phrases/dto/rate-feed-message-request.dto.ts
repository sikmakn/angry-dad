import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn } from 'class-validator';
import type { RatingDto } from '../../phrases/dto/rating.dto';
export class RateFeedMessageRequestDto {
  @ApiProperty({
    required: true,
    description: '0 «слабо», 1 «неприятно», 2 «в самое больное»',
    enum: [0, 1, 2],
  })
  @IsDefined()
  @IsIn([0, 1, 2])
  score!: RatingDto;
}
