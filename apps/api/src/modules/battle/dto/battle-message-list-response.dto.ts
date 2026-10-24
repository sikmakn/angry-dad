import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { BattleMessageResponseDto } from '../../battle/dto/battle-message-response.dto';
export class BattleMessageListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [BattleMessageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BattleMessageResponseDto)
  items!: (BattleMessageResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
