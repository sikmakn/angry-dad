import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateIf, IsIn, IsString, ValidateNested } from 'class-validator';
import type { RoleDto } from '../../users/dto/role.dto';
import type { GenderDto } from '../../users/dto/gender.dto';
import { QuietHoursDto } from '../../users/dto/quiet-hours.dto';
export class UpdateMeRequestDto {
  @ApiProperty({
    required: false,
    description: 'Вредный родитель',
    enum: ['father', 'mother'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['father', 'mother'])
  role?: RoleDto;

  @ApiProperty({
    required: false,
    enum: ['male', 'female'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['male', 'female'])
  gender?: GenderDto;

  @ApiProperty({
    required: false,
    description: 'IANA-зона',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  timeZone?: string;

  @ApiProperty({
    required: false,
    description: 'Тихие часы в минутах от полуночи местного времени, шаг 30. Длина интервала от начала до\nконца (через полночь тоже) от 0 до 12 часов; длина 0 означает, что тихих часов нет.\n',
    type: () => QuietHoursDto,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}
