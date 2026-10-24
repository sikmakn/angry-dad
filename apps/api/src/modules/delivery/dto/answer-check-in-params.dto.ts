import { IsString } from 'class-validator';
export class AnswerCheckInParamsDto {
  @IsString()
  feedMessageId!: string;
}
