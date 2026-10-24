import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
export class ListTasksQueryDto {
  @ApiProperty({
    type: 'integer',
    required: false,
    default: 50,
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  cursor?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['active', 'stopped', 'closed'])
  status?: 'active' | 'stopped' | 'closed';

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['one_time', 'recurring'])
  kind?: 'one_time' | 'recurring';

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['deadline', '-createdAt'])
  sort?: 'deadline' | '-createdAt';
}
