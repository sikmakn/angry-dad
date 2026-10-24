import { IsString } from 'class-validator';
export class UpdateTaskParamsDto {
  @IsString()
  taskId!: string;
}
