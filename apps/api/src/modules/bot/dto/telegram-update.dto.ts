import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt } from 'class-validator';
export class TelegramUpdateDto {
  @ApiProperty({
    required: true,
    type: 'integer',
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
  })
  @IsDefined()
  @IsInt()
  update_id!: number;
}
