import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested } from 'class-validator';
import { TaskResponseDto } from '../../tasks/dto/task-response.dto';
export class TaskListResponseDto {
  @ApiProperty({
    required: true,
    type: () => [TaskResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskResponseDto)
  items!: (TaskResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
