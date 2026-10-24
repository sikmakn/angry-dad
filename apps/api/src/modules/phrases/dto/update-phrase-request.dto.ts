import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn } from 'class-validator';
export class UpdatePhraseRequestDto {
  @ApiProperty({
    required: true,
    enum: ['enabled', 'disabled'],
  })
  @IsDefined()
  @IsIn(['enabled', 'disabled'])
  status!: 'enabled' | 'disabled';
}
