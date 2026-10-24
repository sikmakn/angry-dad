import { IsString } from 'class-validator';
export class GetTaskParamsDto {
  @IsString()
  taskId!: string;
}
