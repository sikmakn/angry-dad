import { IsString, MinLength, MaxLength, ValidateIf } from 'class-validator';
export class CreateBattleQuoteHeadersDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  key?: string;
}
