import { IsIn } from 'class-validator';
export class ListBattleMessagesParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
