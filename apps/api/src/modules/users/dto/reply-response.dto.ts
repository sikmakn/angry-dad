import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Allow } from 'class-validator';
export class ReplyResponseDto {
  @ApiProperty({
    required: true,
    description: 'Фраза персонажа или `null`, если персонаж молчит',
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  reply!: string | null;
}
