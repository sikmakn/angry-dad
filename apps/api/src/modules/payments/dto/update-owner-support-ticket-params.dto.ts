import { IsString } from 'class-validator';
export class UpdateOwnerSupportTicketParamsDto {
  @IsString()
  ticketId!: string;
}
