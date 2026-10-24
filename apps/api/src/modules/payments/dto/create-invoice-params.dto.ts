import { IsString } from 'class-validator';
export class CreateInvoiceParamsDto {
  @IsString()
  packageId!: string;
}
