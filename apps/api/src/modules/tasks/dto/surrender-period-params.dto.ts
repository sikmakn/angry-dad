import { IsString } from 'class-validator';
export class SurrenderPeriodParamsDto {
  @IsString()
  periodId!: string;
}
