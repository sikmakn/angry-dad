import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsString, MinLength, MaxLength, IsIn } from 'class-validator';
export class UpdateTaskRequestDto {
  @Transform(({ value }: {
    value: unknown;
  }) => typeof value === 'string' ? value.trim() : value)
  @ApiProperty({
    required: false,
    minLength: 1,
    maxLength: 120,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Единственный допустимый переход — остановка повторяющейся задачи',
    enum: ['stopped'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['stopped'])
  status?: 'stopped';
}
