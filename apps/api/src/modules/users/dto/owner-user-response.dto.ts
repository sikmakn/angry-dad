import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, ValidateIf, IsString } from 'class-validator';
export class OwnerUserResponseDto {
  @ApiProperty({
    required: true,
    format: 'int64',
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  telegramId!: number;

  @ApiProperty({
    required: false,
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
}
