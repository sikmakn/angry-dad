import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
export class CreateBattleQuoteRequestDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  feedMessageId!: string;
}
