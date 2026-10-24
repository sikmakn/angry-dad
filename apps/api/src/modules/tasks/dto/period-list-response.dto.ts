import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { PeriodResponseDto } from '../../tasks/dto/period-response.dto';
export class PeriodListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PeriodResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeriodResponseDto)
  items!: (PeriodResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
