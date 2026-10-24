import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, IsBoolean, ValidateIf, IsIn, ValidateNested, IsNumber, Min, Max, IsDivisibleBy, IsInt, IsISO8601 } from 'class-validator';
import type { OnboardingStateDto } from '../../users/dto/onboarding-state.dto';
import type { RoleDto } from '../../users/dto/role.dto';
import type { GenderDto } from '../../users/dto/gender.dto';
import { QuietHoursDto } from '../../users/dto/quiet-hours.dto';
export class MeResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    description: 'Пользователь — владелец продукта (Telegram ID из настройки); вычисляется, показывать раздел «Владелец»',
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  isOwner!: boolean;

  @ApiProperty({
    required: false,
    description: 'Только у гостя: аккаунт был удалён раньше. Тогда после выбора родителя Mini App\nпоказывает постоянную фразу «Снова начинаем…» (R-8) с окончанием по роли.\n',
    type: Boolean,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsBoolean()
  returning?: boolean;

  @ApiProperty({
    required: false,
    description: 'Нет у пользователей без username',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  username?: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  firstName?: string;

  @ApiProperty({
    required: true,
    enum: ['guest', 'done'],
  })
  @IsDefined()
  @IsIn(['guest', 'done'])
  onboarding!: OnboardingStateDto;

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
    required: true,
    description: 'IANA-зона, по умолчанию Europe/Moscow',
    type: String,
  })
  @IsDefined()
  @IsString()
  timeZone!: string;

  @ApiProperty({
    required: true,
    description: 'Тихие часы в минутах от полуночи местного времени, шаг 30. Длина интервала от начала до\nконца (через полночь тоже) от 0 до 12 часов; длина 0 означает, что тихих часов нет.\n',
    type: () => QuietHoursDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours!: QuietHoursDto;

  @ApiProperty({
    required: true,
    description: 'Уважение. Экран показывает целую часть с округлением вниз.',
    minimum: 0,
    maximum: 100,
    multipleOf: 0.5,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsDivisibleBy(0.5)
  respect!: number;

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  inLeaderboard!: boolean;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  closedCount!: number;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  closedCountAt?: string;
}
