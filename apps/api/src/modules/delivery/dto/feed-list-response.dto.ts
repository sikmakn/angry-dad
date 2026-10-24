import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, Allow, IsArray, ValidateNested, ValidateIf, IsInt, Min, IsISO8601 } from 'class-validator';
import { FeedMessageResponseDto } from '../../delivery/dto/feed-message-response.dto';
export class FeedListResponseDto {
  @ApiProperty({
    required: false,
    type: Number,
    description: 'Непрочитанные уведомления пользователя (напоминания, проверки, пропуски, провалы и отсутствие), без ограничения страницей',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  unreadCount?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Все проверки активных задач, на которые ещё можно ответить',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  unansweredCount?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Непрочитанные уведомления и проверки, ожидающие ответа, без двойного счёта',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  activeCount?: number;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    description: 'Ближайший общий срок ответа: 15 минут от первой проверки без ответа. Чтение и новые сообщения его не сдвигают.',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsISO8601()
  nextAnswerDueAt?: string;

  @ApiProperty({
    required: true,
    type: () => [FeedMessageResponseDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedMessageResponseDto)
  items!: (FeedMessageResponseDto)[];

  @ApiProperty({
    required: true,
    type: String,
    nullable: true,
  })
  @IsDefined()
  @Allow()
  nextCursor!: string | null;
}
