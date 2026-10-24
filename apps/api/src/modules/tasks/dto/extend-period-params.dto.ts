import { IsString } from 'class-validator';
export class ExtendPeriodParamsDto {
  @IsString()
  periodId!: string;
}
