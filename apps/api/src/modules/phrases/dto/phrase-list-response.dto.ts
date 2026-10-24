import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { PhraseResponseDto } from '../../phrases/dto/phrase-response.dto';
export class PhraseListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PhraseResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhraseResponseDto)
  items!: (PhraseResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
