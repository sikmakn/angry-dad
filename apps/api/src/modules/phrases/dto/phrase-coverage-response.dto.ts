import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsArray, ValidateNested } from 'class-validator';
import { PhraseCoverageItemDto } from '../../phrases/dto/phrase-coverage-item.dto';
export class PhraseCoverageResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PhraseCoverageItemDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhraseCoverageItemDto)
  items!: (PhraseCoverageItemDto)[];
}
