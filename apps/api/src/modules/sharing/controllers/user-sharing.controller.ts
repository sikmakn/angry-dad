import { Controller, Post, Body, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { SharingService } from '../../sharing/sharing.service';
import { CreateShareRequestDto } from '../../sharing/dto/create-share-request.dto';
import { ShareResponseDto } from '../../sharing/dto/share-response.dto';
@ApiTags('sharing')
@Controller()
export class UserSharingController {
  constructor(private readonly sharing: SharingService) { }
  @Post('shares')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createShare',
    summary: 'Карточка для шеринга',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: CreateShareRequestDto })
  @ApiResponse({
    status: 409,
    description: 'role_mismatch: для kind=battle доступна только текущая роль',
  })
  @ApiResponse({
    status: 201,
    description: 'Карточка готова',
    type: ShareResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'BadRequest',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'NotFound',
  })
  @ApiResponse({
    status: 503,
    description: 'ServiceUnavailable',
  })
  async createShare(
    @Req()
    request: AuthRequest,
    @Body()
    body: CreateShareRequestDto): Promise<ShareResponseDto> {
    return this.sharing.create(request.user, {
      kind: body.kind,
      periodId: body.periodId,
      role: body.role,
    });
  }
}
