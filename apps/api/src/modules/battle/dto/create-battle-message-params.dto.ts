import { IsIn } from 'class-validator';
export class CreateBattleMessageParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
