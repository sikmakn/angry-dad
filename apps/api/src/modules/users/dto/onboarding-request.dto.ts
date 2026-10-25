import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsIn, ValidateIf, IsString, ValidateNested } from 'class-validator';
import type { RoleDto } from '../../users/dto/role.dto';
import type { GenderDto } from '../../users/dto/gender.dto';
import { QuietHoursDto } from '../../users/dto/quiet-hours.dto';
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

  @ApiProperty({
    required: true,
    description: 'Тихие часы в минутах от полуночи местного времени, шаг 30. Интервал от начала до конца\n(через полночь тоже) любой длины; если начало и конец совпадают, тихих часов нет.\nОбязательно: пользователь выбирает при старте (по умолчанию в приложении с 22:00 до 09:00).\n',
    type: () => QuietHoursDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours!: QuietHoursDto;
}
