import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, IsIn, ValidateIf, IsInt, Min, Max, IsBoolean } from 'class-validator';
import type { PhraseRoleDto } from '../../phrases/dto/phrase-role.dto';
import type { PhraseCategoryDto } from '../../phrases/dto/phrase-category.dto';
import type { PhraseDefeatLevelDto } from '../../phrases/dto/phrase-defeat-level.dto';
import type { PhraseComboDto } from '../../phrases/dto/phrase-combo.dto';
import type { PhraseSourceDto } from '../../phrases/dto/phrase-source.dto';
import type { PhraseStatusDto } from '../../phrases/dto/phrase-status.dto';
export class PhraseResponseDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsDefined()
  @IsString()
  id!: string;

  @ApiProperty({
    required: true,
    enum: ['father', 'mother', 'any'],
  })
  @IsDefined()
  @IsIn(['father', 'mother', 'any'])
  role!: PhraseRoleDto;

  @ApiProperty({
    required: true,
    enum: ['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'],
  })
  @IsDefined()
  @IsIn(['on_greeting', 'on_task_set', 'on_delete', 'on_vague', 'on_reminder', 'on_check_in', 'on_check_in_reply', 'on_check_in_missed', 'on_fail', 'on_excuse', 'on_excuse_denied', 'on_retry', 'on_success', 'on_absent', 'on_battle_start', 'on_break', 'on_recovery'])
  category!: PhraseCategoryDto;

  @ApiProperty({
    required: false,
    description: 'Только у категорий с уровнями',
    minimum: 1,
    maximum: 3,
    type: 'integer',
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(3)
  level?: number;

  @ApiProperty({
    required: true,
    description: 'Уровень побеждённости 1–4 или `any`',
    enum: ['1', '2', '3', '4', 'any'],
  })
  @IsDefined()
  @IsIn(['1', '2', '3', '4', 'any'])
  defeatLevel!: PhraseDefeatLevelDto;

  @ApiProperty({
    required: true,
    enum: ['father_son', 'father_daughter', 'mother_son', 'mother_daughter', 'any'],
  })
  @IsDefined()
  @IsIn(['father_son', 'father_daughter', 'mother_son', 'mother_daughter', 'any'])
  combo!: PhraseComboDto;

  @ApiProperty({
    required: true,
    description: 'Шаблон с вариантами рода и переменными',
    type: String,
  })
  @IsDefined()
  @IsString()
  template!: string;

  @ApiProperty({
    required: true,
    enum: ['owner', 'subscriber', 'paraphrase'],
  })
  @IsDefined()
  @IsIn(['owner', 'subscriber', 'paraphrase'])
  source!: PhraseSourceDto;

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  author?: string;

  @ApiProperty({
    required: true,
    enum: ['enabled', 'disabled', 'pending_review'],
  })
  @IsDefined()
  @IsIn(['enabled', 'disabled', 'pending_review'])
  status!: PhraseStatusDto;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  shows!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  votes!: number;

  @ApiProperty({
    required: true,
    minimum: 0,
    type: 'integer',
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  scoreSum!: number;

  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  belowThreshold!: boolean;
}
