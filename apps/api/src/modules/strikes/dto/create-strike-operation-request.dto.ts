import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, IsInt, Min, IsString, MinLength, MaxLength } from 'class-validator';
export class CreateStrikeOperationRequestDto {
  @ApiProperty({
    required: true,
    enum: ['manual_grant', 'manual_revoke'],
  })
  @IsDefined()
  @IsIn(['manual_grant', 'manual_revoke'])
  type!: 'manual_grant' | 'manual_revoke';

  @ApiProperty({
    required: true,
    minimum: 1,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({
    required: true,
    minLength: 1,
    maxLength: 500,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
