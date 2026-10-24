import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn } from 'class-validator';
import type { CheckInAnswerDto } from '../../tasks/dto/check-in-answer.dto';
export class CheckInAnswerRequestDto {
  @ApiProperty({
    required: true,
    enum: ['done', 'partial', 'not_started'],
  })
  @IsDefined()
  @IsIn(['done', 'partial', 'not_started'])
  answer!: CheckInAnswerDto;
}
