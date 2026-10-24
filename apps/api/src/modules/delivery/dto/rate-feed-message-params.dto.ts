import { IsString } from 'class-validator';
export class RateFeedMessageParamsDto {
  @IsString()
  feedMessageId!: string;
}
