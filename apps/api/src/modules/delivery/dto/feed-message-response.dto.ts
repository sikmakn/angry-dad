import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsString, IsIn, IsBoolean, ValidateIf, ValidateNested, IsISO8601 } from 'class-validator';
import type { PhraseCategoryDto } from '../../phrases/dto/phrase-category.dto';
import { FeedMessageResponseCheckInDto } from '../../delivery/dto/feed-message-response-check-in.dto';
import type { RatingDto } from '../../phrases/dto/rating.dto';
export class FeedMessageResponseDto {
  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    description: 'Когда пользователь открыл уведомление в приложении',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsISO8601()
  readAt?: string;

  @ApiProperty({
    required: false,
    type: Boolean,
    description: 'Проверка ещё ждёт ответа и относится к активному периоду задачи',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsBoolean()
  needsAnswer?: boolean;

  @ApiProperty({
    required: false,
    enum: ['done', 'give_up', 'failed'],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn(['done', 'give_up', 'failed'])
  taskOutcome?: 'done' | 'give_up' | 'failed';

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    enum: ['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'],
  })
  @IsDefined()
  @IsIn(['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'])
  category!: PhraseCategoryDto;

  @ApiProperty({
    required: true,
    description: 'Категория оценивается; кнопки оценки показывать, пока нет rating',
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  rateable!: boolean;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  text!: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  periodId?: string;

  @ApiProperty({
    required: false,
    description: 'Снимок названия задачи для «Ответить»',
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  taskTitle?: string;

  @ApiProperty({
    required: false,
    description: 'Только у проверок. Без `answer` и `missedAt` проверка ждёт ответа.',
    type: () => FeedMessageResponseCheckInDto,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @ValidateNested()
  @Type(() => FeedMessageResponseCheckInDto)
  checkIn?: FeedMessageResponseCheckInDto;

  @ApiProperty({
    required: false,
    description: '0 «слабо», 1 «неприятно», 2 «в самое больное»',
    enum: [0, 1, 2],
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsIn([0, 1, 2])
  rating?: RatingDto;

  @ApiProperty({
    required: true,
    format: 'date-time',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsISO8601()
  sentAt!: string;
}
