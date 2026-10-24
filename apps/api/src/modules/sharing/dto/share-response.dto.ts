import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
export class ShareResponseDto {
  @ApiProperty({
    required: true,
    description: 'Идентификатор подготовленного сообщения для `shareMessage` Mini App',
    type: String,
  })
  @IsDefined()
  @IsString()
  preparedMessageId!: string;
}
