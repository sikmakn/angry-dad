import { IsString } from 'class-validator';
export class ListTaskPeriodsParamsDto {
  @IsString()
  taskId!: string;
}
