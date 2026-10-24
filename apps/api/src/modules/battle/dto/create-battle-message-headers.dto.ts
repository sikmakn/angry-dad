import { IsString, MinLength, MaxLength } from 'class-validator';
export class CreateBattleMessageHeadersDto {
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  key!: string;
}
