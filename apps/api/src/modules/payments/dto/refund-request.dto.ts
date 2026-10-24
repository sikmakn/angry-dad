import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength, MaxLength } from 'class-validator';
export class RefundRequestDto {
  @ApiProperty({
    required: true,
    minLength: 1,
    maxLength: 500,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
