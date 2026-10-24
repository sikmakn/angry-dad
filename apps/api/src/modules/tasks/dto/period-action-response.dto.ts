import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, ValidateNested, IsNumber, IsDivisibleBy, Min, Max } from 'class-validator';
import { TaskResponseDto } from '../../tasks/dto/task-response.dto';
export class PeriodActionResponseDto {
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
    description: 'Точное изменение уважения от этого действия (после потолков), для «Уважение: 15 (+3)»',
    multipleOf: 0.5,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @IsDivisibleBy(0.5)
  respectDelta!: number;

  @ApiProperty({
    required: true,
    description: 'Уважение после действия',
    minimum: 0,
    maximum: 100,
    multipleOf: 0.5,
    type: Number,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsDivisibleBy(0.5)
  respect!: number;

  @ApiProperty({
    required: true,
    description: 'Фраза персонажа (onSuccess, onExcuse, onRetry, onCheckInReply) или `null`',
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  reply!: string | null;
}
