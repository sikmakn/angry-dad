import { Controller, Get, Param, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { UsersService } from '../../users/users.service';
import { GetOwnerUserParamsDto } from '../dto/get-owner-user-params.dto';
import { OwnerUserResponseDto } from '../../users/dto/owner-user-response.dto';
@ApiTags('users')
@Controller()
export class OwnerUsersController {
  constructor(private readonly users: UsersService) { }
  @Get('owner/users/:telegramId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerUser',
    summary: 'Владелец. Пользователь по Telegram ID',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Пользователь',
    type: OwnerUserResponseDto,
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
  async getOwnerUser(
    @Param()
    params: GetOwnerUserParamsDto): Promise<OwnerUserResponseDto> {
    return this.users.ownerUser(params.telegramId);
  }
}
