import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, ValidateIf, IsString } from 'class-validator';
import type { ShareKindDto } from '../../sharing/dto/share-kind.dto';
import type { RoleDto } from '../../users/dto/role.dto';
export class CreateShareRequestDto {
  @ApiProperty({
    required: true,
    enum: ['done', 'fail', 'battle'],
  })
  @IsDefined()
  @IsIn(['done', 'fail', 'battle'])
  kind!: ShareKindDto;

  @ApiProperty({
    required: false,
    description: 'Для `done` и `fail`',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  periodId?: string;

  @ApiProperty({
    required: false,
    description: 'Вредный родитель',
    enum: ['father', 'mother'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['father', 'mother'])
  role?: RoleDto;
}
