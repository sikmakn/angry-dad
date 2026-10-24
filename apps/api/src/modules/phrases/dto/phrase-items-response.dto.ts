import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsArray, ValidateNested } from 'class-validator';
import { PhraseResponseDto } from '../../phrases/dto/phrase-response.dto';
export class PhraseItemsResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PhraseResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhraseResponseDto)
  items!: (PhraseResponseDto)[];
}
