import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsArray, ValidateNested } from 'class-validator';
import { PackageResponseDto } from '../../payments/dto/package-response.dto';
export class PackageListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PackageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageResponseDto)
  items!: (PackageResponseDto)[];
}
