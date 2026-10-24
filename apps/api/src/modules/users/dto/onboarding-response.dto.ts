import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested, IsArray } from 'class-validator';
import { MeResponseDto } from '../../users/dto/me-response.dto';
export class OnboardingResponseDto {
  @ApiProperty({
    required: true,
    description: 'Профиль владельцу записи. Telegram ID пользователю не возвращается.',
    type: () => MeResponseDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => MeResponseDto)
  user!: MeResponseDto;

  @ApiProperty({
    required: true,
    description: 'Тексты экранов после выбора по порядку: «Соболезнуем Вам. Крепитесь…», «Опять ничего…\nЧто тебе надо сделать?», «Мечты сюда не пиши…». С подстановкой рода. «Снова начинаем…»\nсюда не входит (см. `MeResponse.returning`). В «Историю» эти тексты не попадают.\nКлиент вызывает `completeOnboarding` после выбора родителя и пола, до экрана «Соболезнуем».\n',
    type: [String],
  })
  @IsDefined()
  @IsArray()
  replies!: (string)[];
}
