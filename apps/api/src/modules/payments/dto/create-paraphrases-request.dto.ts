import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsInt, Min, Max } from 'class-validator';
export class CreateParaphrasesRequestDto {
  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 5,
    type: 'integer',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(5)
  count?: number;
}
