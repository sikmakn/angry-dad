import { IsIn } from 'class-validator';
export class ReplaceOwnerRoleCardParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
