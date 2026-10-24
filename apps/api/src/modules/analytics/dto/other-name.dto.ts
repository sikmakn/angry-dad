import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsIn, IsArray } from 'class-validator';
import type { GenderDto } from '../../users/dto/gender.dto';
export class OtherNameDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  name!: string;

  @ApiProperty({
    required: true,
    enum: ['male', 'female'],
  })
  @IsDefined()
  @IsIn(['male', 'female'])
  gender!: GenderDto;

  @ApiProperty({
    required: true,
    description: 'Формы имени по падежам',
    type: [String],
  })
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  cases!: (string)[];
}
