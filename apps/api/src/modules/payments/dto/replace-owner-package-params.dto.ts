import { IsString } from 'class-validator';
export class ReplaceOwnerPackageParamsDto {
  @IsString()
  packageId!: string;
}
