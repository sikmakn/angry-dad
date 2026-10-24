import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsInt, IsIn, IsISO8601 } from 'class-validator';
import type { SupportTicketStatusDto } from '../../payments/dto/support-ticket-status.dto';
export class SupportTicketResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    format: 'int64',
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  telegramId!: number;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  text!: string;

  @ApiProperty({
    required: true,
    enum: ['open', 'resolved'],
  })
  @IsDefined()
  @IsIn(['open', 'resolved'])
  status!: SupportTicketStatusDto;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  at!: string;
}
