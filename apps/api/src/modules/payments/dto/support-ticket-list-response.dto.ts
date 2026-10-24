import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { SupportTicketResponseDto } from '../../payments/dto/support-ticket-response.dto';
export class SupportTicketListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [SupportTicketResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportTicketResponseDto)
  items!: (SupportTicketResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
