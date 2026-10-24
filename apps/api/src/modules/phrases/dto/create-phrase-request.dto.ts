import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsIn, ValidateIf, IsInt, Min, Max, IsString, MinLength } from 'class-validator';
import type { PhraseRoleDto } from '../../phrases/dto/phrase-role.dto';
import type { PhraseCategoryDto } from '../../phrases/dto/phrase-category.dto';
import type { PhraseDefeatLevelDto } from '../../phrases/dto/phrase-defeat-level.dto';
import type { PhraseComboDto } from '../../phrases/dto/phrase-combo.dto';
export class CreatePhraseRequestDto {
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
    minLength: 1,
    type: String,
  })
  @IsDefined()
  @IsString()
  @MinLength(1)
  template!: string;

  @ApiProperty({
    required: true,
    enum: ['owner', 'subscriber'],
  })
  @IsDefined()
  @IsIn(['owner', 'subscriber'])
  source!: 'owner' | 'subscriber';

  @ApiProperty({
    required: false,
    type: String,
  })
  @ValidateIf((_value, value: unknown) => value !== undefined)
  @IsString()
  author?: string;
}
