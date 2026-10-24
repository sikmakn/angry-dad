import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';
export class PaymentListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [PaymentResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentResponseDto)
  items!: (PaymentResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
