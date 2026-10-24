import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, ValidateIf, IsString } from 'class-validator';
import type { RoleDto } from '../../users/dto/role.dto';
import type { GenderDto } from '../../users/dto/gender.dto';
export class OnboardingRequestDto {
  @ApiProperty({
    required: true,
    description: 'Вредный родитель',
    enum: ['father', 'mother'],
  })
  @IsDefined()
  @IsIn(['father', 'mother'])
  role!: RoleDto;

  @ApiProperty({
    required: true,
    enum: ['male', 'female'],
  })
  @IsDefined()
  @IsIn(['male', 'female'])
  gender!: GenderDto;

  @ApiProperty({
    required: false,
    description: 'IANA-зона с устройства; без неё Europe/Moscow',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  timeZone?: string;
}
