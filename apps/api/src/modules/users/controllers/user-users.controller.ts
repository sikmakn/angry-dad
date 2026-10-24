import { Controller, Get, Post, Patch, Delete, Body, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { UsersService } from '../../users/users.service';
import { AccountDeletionService } from '../../users/services/account-deletion.service';
import { MeResponseDto } from '../../users/dto/me-response.dto';
import { UpdateMeRequestDto } from '../../users/dto/update-me-request.dto';
import { OnboardingRequestDto } from '../../users/dto/onboarding-request.dto';
import { OnboardingResponseDto } from '../../users/dto/onboarding-response.dto';
@ApiTags('users')
@Controller()
export class UserUsersController {
  constructor(private readonly users: UsersService, private readonly deletion: AccountDeletionService) { }
  @Get('me')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getMe',
    summary: 'Мой профиль',
  })
  @UseGuards(TelegramAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Профиль',
    type: MeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMe(
    @Req()
    request: AuthRequest): Promise<MeResponseDto> {
    return this.users.me(request.user);
  }

  @Patch('me')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'updateMe',
    summary: 'Изменить настройки',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: UpdateMeRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Обновлённый профиль',
    type: MeResponseDto,
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
  async updateMe(
    @Req()
    request: AuthRequest,
    @Body()
    body: UpdateMeRequestDto): Promise<MeResponseDto> {
    return this.users.update(request.user, {
      role: body.role,
      gender: body.gender,
      timeZone: body.timeZone,
      quietHours: body.quietHours,
    });
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteMe',
    summary: 'Удалить аккаунт',
  })
  @UseGuards(TelegramAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'Аккаунт удалён',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteMe(
    @Req()
    request: AuthRequest): Promise<void> {
    await this.deletion.delete(request.user);
  }

  @Post('me/onboarding')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'completeOnboarding',
    summary: 'Завершить старт',
  })
  @UseGuards(TelegramAuthGuard)
  @ApiBody({ type: OnboardingRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Старт пройден',
    type: OnboardingResponseDto,
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
    status: 409,
    description: 'Conflict',
  })
  async completeOnboarding(
    @Req()
    request: AuthRequest,
    @Body()
    body: OnboardingRequestDto): Promise<OnboardingResponseDto> {
    return this.users.onboarding(request.user, {
      role: body.role,
      gender: body.gender,
      timeZone: body.timeZone,
    });
  }
}
