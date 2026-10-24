import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { OwnerJournalEntryDto } from '../../analytics/dto/owner-journal-entry.dto';
export class OwnerJournalListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [OwnerJournalEntryDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OwnerJournalEntryDto)
  items!: (OwnerJournalEntryDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
