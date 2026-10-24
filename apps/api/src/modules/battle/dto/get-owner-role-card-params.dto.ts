import { IsIn } from 'class-validator';
export class GetOwnerRoleCardParamsDto {
  @IsIn(['father', 'mother'])
  role!: 'father' | 'mother';
}
