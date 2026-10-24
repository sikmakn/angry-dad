import { IsString } from 'class-validator';
export class CompletePeriodParamsDto {
  @IsString()
  periodId!: string;
}
