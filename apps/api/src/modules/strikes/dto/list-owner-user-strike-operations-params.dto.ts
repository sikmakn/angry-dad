import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
export class ListOwnerUserStrikeOperationsParamsDto {
  @ApiProperty({
    type: 'integer',
    format: 'int64',
  })
  @Type(() => Number)
  @IsInt()
  telegramId!: number;
}
