import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsBoolean } from 'class-validator';
export class WebhookAckDto {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  ok!: boolean;
}
