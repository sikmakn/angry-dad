import { IsString } from 'class-validator';
export class DeleteTaskParamsDto {
  @IsString()
  taskId!: string;
}
