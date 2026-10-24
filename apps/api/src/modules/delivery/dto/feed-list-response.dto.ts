import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { FeedMessageResponseDto } from '../../delivery/dto/feed-message-response.dto';
export class FeedListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [FeedMessageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedMessageResponseDto)
  items!: (FeedMessageResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
