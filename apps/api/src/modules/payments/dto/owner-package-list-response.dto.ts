import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsArray, ValidateNested } from 'class-validator';
import { OwnerPackageResponseDto } from '../../payments/dto/owner-package-response.dto';
export class OwnerPackageListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [OwnerPackageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OwnerPackageResponseDto)
  items!: (OwnerPackageResponseDto)[];
}
