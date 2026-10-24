import { IsString } from 'class-validator';
export class UpdateOwnerPhraseParamsDto {
  @IsString()
  phraseId!: string;
}
