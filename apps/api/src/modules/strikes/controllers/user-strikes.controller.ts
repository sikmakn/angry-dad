import { Controller, Get, Query, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { StrikesService } from '../../strikes/strikes.service';
import { StrikeBalanceResponseDto } from '../../strikes/dto/strike-balance-response.dto';
import { ListMyStrikeOperationsQueryDto } from '../dto/list-my-strike-operations-query.dto';
import { StrikeOperationListResponseDto } from '../../strikes/dto/strike-operation-list-response.dto';
@ApiTags('strikes')
@Controller()
export class UserStrikesController {
  constructor(private readonly strikes: StrikesService) { }
  @Get('me/strikes')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getMyStrikes',
    summary: 'Баланс ударов',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Баланс',
    type: StrikeBalanceResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async getMyStrikes(
    @Req()
    request: AuthRequest): Promise<StrikeBalanceResponseDto> {
    return this.strikes.balance(request.user._id);
  }

  @Get('me/strike-operations')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listMyStrikeOperations',
    summary: 'История операций с ударами',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница операций',
    type: StrikeOperationListResponseDto,
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
  async listMyStrikeOperations(
    @Req()
    request: AuthRequest,
    @Query()
    query: ListMyStrikeOperationsQueryDto): Promise<StrikeOperationListResponseDto> {
    return this.strikes.operations(request.user._id, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }
}
