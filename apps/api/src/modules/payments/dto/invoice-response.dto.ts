import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { PackageSnapshotDto } from '../../payments/dto/package-snapshot.dto';
export class InvoiceResponseDto {
  @ApiProperty({
    required: true,
    description: 'Ссылка на счёт для окна оплаты Telegram',
    format: 'uri',
    type: String,
  })
  @IsDefined()
  @IsString()
  invoiceUrl!: string;

  @ApiProperty({
    required: true,
    description: 'Состав и цена на момент создания счёта',
    type: () => PackageSnapshotDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => PackageSnapshotDto)
  packageSnapshot!: PackageSnapshotDto;
}
