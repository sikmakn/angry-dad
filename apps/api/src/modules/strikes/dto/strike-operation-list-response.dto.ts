import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { StrikeOperationResponseDto } from '../../strikes/dto/strike-operation-response.dto';
export class StrikeOperationListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [StrikeOperationResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrikeOperationResponseDto)
  items!: (StrikeOperationResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
