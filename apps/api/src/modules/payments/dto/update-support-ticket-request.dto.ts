import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn } from 'class-validator';
import type { SupportTicketStatusDto } from '../../payments/dto/support-ticket-status.dto';
export class UpdateSupportTicketRequestDto {
  @ApiProperty({
    required: true,
    enum: ['open', 'resolved'],
  })
  @IsDefined()
  @IsIn(['open', 'resolved'])
  status!: SupportTicketStatusDto;
}
