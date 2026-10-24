import { IsIn } from 'class-validator';
export class GetBattleDialogParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
