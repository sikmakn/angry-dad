import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsIn, IsString, IsInt, Min, Max } from 'class-validator';
export class ListFeedQueryDto {
  @ApiProperty({
    type: 'integer',
    required: false,
    default: 50,
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  cursor?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  periodId?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'])
  category?: 'on_greeting' | 'on_task_set' | 'on_delete' | 'on_vague' | 'on_reminder' | 'on_check_in' | 'on_check_in_reply' | 'on_check_in_missed' | 'on_fail' | 'on_excuse' | 'on_excuse_denied' | 'on_retry' | 'on_success' | 'on_absent' | 'on_battle_start' | 'on_break' | 'on_recovery';
}
