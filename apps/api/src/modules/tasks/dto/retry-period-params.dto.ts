import { IsString } from 'class-validator';
export class RetryPeriodParamsDto {
  @IsString()
  periodId!: string;
}
