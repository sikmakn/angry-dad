import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength, MaxLength, Matches } from 'class-validator';
export class CreateBattleMessageRequestDto {
  @ApiProperty({
    required: true,
    description: 'Не меньше 2 непробельных символов',
    minLength: 2,
    maxLength: 300,
    pattern: '^[\\s\\S]*\\S[\\s\\S]*\\S[\\s\\S]*$',
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @Matches(new RegExp('^[\\s\\S]*\\S[\\s\\S]*\\S[\\s\\S]*$'))
  text!: string;
}
