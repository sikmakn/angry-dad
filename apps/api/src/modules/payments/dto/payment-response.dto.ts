import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, IsBoolean, IsInt, ValidateNested, IsIn, ValidateIf, IsISO8601 } from 'class-validator';
import { PackageSnapshotDto } from '../../payments/dto/package-snapshot.dto';
import type { PaymentStatusDto } from '../../payments/dto/payment-status.dto';
export class PaymentResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    description: 'Возврат Stars возможен сейчас (статус `credited`, из партии не израсходовано ни одного удара, пользователь не удалён)',
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  refundable!: boolean;

  @ApiProperty({
    required: true,
    format: 'int64',
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  telegramId!: number;

  @ApiProperty({
    required: true,
    description: 'Состав и цена на момент создания счёта',
    type: () => PackageSnapshotDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => PackageSnapshotDto)
  packageSnapshot!: PackageSnapshotDto;

  @ApiProperty({
    required: true,
    enum: ['invoiced', 'paid', 'credited', 'refunded'],
  })
  @IsDefined()
  @IsIn(['invoiced', 'paid', 'credited', 'refunded'])
  status!: PaymentStatusDto;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  telegramChargeId?: string;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  paidAt?: string;

  @ApiProperty({
    required: false,
    format: 'date-time',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  @IsISO8601()
  creditedAt?: string;
}
