import { IsString } from 'class-validator';
export class RefundOwnerPaymentParamsDto {
  @IsString()
  paymentId!: string;
}
