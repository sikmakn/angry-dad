import { Controller, Get, Put, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { BattleService } from '../../battle/battle.service';
import { GetOwnerRoleCardParamsDto } from '../dto/get-owner-role-card-params.dto';
import { RoleCardResponseDto } from '../../battle/dto/role-card-response.dto';
import { ReplaceRoleCardRequestDto } from '../../battle/dto/replace-role-card-request.dto';
import { ReplaceOwnerRoleCardParamsDto } from '../dto/replace-owner-role-card-params.dto';
@ApiTags('battle')
@Controller()
export class OwnerBattleController {
  constructor(private readonly battle: BattleService) { }
  @Get('owner/role-cards/:role')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerRoleCard',
    summary: 'Владелец. Карточка роли',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Карточка',
    type: RoleCardResponseDto,
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
  async getOwnerRoleCard(
    @Param()
    params: GetOwnerRoleCardParamsDto): Promise<RoleCardResponseDto> {
    return this.battle.roleCard(params.role);
  }

  @Put('owner/role-cards/:role')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'replaceOwnerRoleCard',
    summary: 'Владелец. Заменить карточку роли',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: ReplaceRoleCardRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Карточка сохранена',
    type: RoleCardResponseDto,
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
  async replaceOwnerRoleCard(
    @Body()
    body: ReplaceRoleCardRequestDto,
    @Param()
    params: ReplaceOwnerRoleCardParamsDto): Promise<RoleCardResponseDto> {
    return this.battle.replaceRoleCard(params.role, {
      character: body.character,
      weakSpots: body.weakSpots,
    });
  }
}
