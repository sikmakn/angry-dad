import { IsString } from 'class-validator';
export class CreateOwnerParaphrasesParamsDto {
  @IsString()
  phraseId!: string;
}
