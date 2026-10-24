import { IsIn } from 'class-validator';
export class CreateBattleQuoteParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
