import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, ValidateNested } from 'class-validator';
import { TaskResponseDto } from '../../tasks/dto/task-response.dto';
export class TaskActionResponseDto {
  @ApiProperty({
    required: true,
    description: 'Задача. `currentPeriod` вложен как исключение из правила «чужую модель не вкладывать»:\nглавная страница показывает таймер и настроение каждой активной задачи (25 и более) и\nоткрывается за один запрос (A4, N-5). Для остальных периодов — `listTaskPeriods`.\nДля остановленной и закрытой задачи это последний период.\n',
    type: () => TaskResponseDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => TaskResponseDto)
  task!: TaskResponseDto;

  @ApiProperty({
    required: true,
    description: 'Фраза персонажа (onTaskSet при постановке, onDelete при остановке), `null` при переименовании',
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  reply!: string | null;
}
