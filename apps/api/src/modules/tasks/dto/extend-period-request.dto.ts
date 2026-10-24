import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, ValidateIf } from 'class-validator';

export class ExtendPeriodRequestDto {
  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    description: 'Новый срок позже текущего. Без поля — плюс один час к текущему сроку.',
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601({
    strict: true,
    strictSeparator: true,
  })
  deadline?: string;
}
