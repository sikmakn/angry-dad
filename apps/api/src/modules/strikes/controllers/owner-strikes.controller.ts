import { isRepeatedResult } from '../../../common/utils/idempotency-result';
import { ApiIdempotencyKey, locationHeaders } from '../../../openapi/response-metadata';
import { Controller, Get, Post, Body, Query, Param, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IdempotencyHeader } from '../../../common/utils/idempotency-header';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { StrikesService } from '../../strikes/strikes.service';
import { UsersService } from '../../users/users.service';
import { GetOwnerUserStrikesParamsDto } from '../dto/get-owner-user-strikes-params.dto';
import { OwnerStrikeBalanceResponseDto } from '../../strikes/dto/owner-strike-balance-response.dto';
import { ListOwnerUserStrikeOperationsQueryDto } from '../dto/list-owner-user-strike-operations-query.dto';
import { ListOwnerUserStrikeOperationsParamsDto } from '../dto/list-owner-user-strike-operations-params.dto';
import { StrikeOperationListResponseDto } from '../../strikes/dto/strike-operation-list-response.dto';
import { CreateStrikeOperationRequestDto } from '../../strikes/dto/create-strike-operation-request.dto';
import { CreateOwnerStrikeOperationParamsDto } from '../dto/create-owner-strike-operation-params.dto';
import { CreateOwnerStrikeOperationHeadersDto } from '../dto/create-owner-strike-operation-headers.dto';
import { StrikeOperationResponseDto } from '../../strikes/dto/strike-operation-response.dto';
@ApiTags('strikes')
@Controller()
export class OwnerStrikesController {
  constructor(private readonly strikes: StrikesService, private readonly users: UsersService) { }
  @Get('owner/users/:telegramId/strikes')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerUserStrikes',
    summary: 'Владелец. Баланс ударов пользователя',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Баланс и партии',
    type: OwnerStrikeBalanceResponseDto,
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
  async getOwnerUserStrikes(
    @Param()
    params: GetOwnerUserStrikesParamsDto): Promise<OwnerStrikeBalanceResponseDto> {
    return this.strikes.ownerBalance((await this.users.byTelegram(params.telegramId))._id);
  }

  @Get('owner/users/:telegramId/strike-operations')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerUserStrikeOperations',
    summary: 'Владелец. История операций пользователя',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
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
  @ApiResponse({
    status: 404,
    description: 'NotFound',
  })
  async listOwnerUserStrikeOperations(
    @Query()
    query: ListOwnerUserStrikeOperationsQueryDto,
    @Param()
    params: ListOwnerUserStrikeOperationsParamsDto): Promise<StrikeOperationListResponseDto> {
    return this.strikes.operations((await this.users.byTelegram(params.telegramId))._id, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Post('owner/users/:telegramId/strike-operations')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createOwnerStrikeOperation',
    summary: 'Владелец. Начислить или вернуть удары',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: CreateStrikeOperationRequestDto })
  @ApiIdempotencyKey(false, 'financial')
  @ApiResponse({
    status: 200,
    description: 'Идентичный повтор, прежняя операция',
    type: StrikeOperationResponseDto,
    headers: locationHeaders('/api/owner/users/{telegramId}/strike-operations'),
  })
  @ApiResponse({
    status: 201,
    description: 'Операция записана',
    headers: locationHeaders('/api/owner/users/{telegramId}/strike-operations'),
    type: StrikeOperationResponseDto,
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
    status: 409,
    description: 'Conflict',
  })
  async createOwnerStrikeOperation(
    @Body()
    body: CreateStrikeOperationRequestDto,
    @Param()
    params: CreateOwnerStrikeOperationParamsDto,
    @IdempotencyHeader()
    headers: CreateOwnerStrikeOperationHeadersDto,
    @Res({ passthrough: true })
    response: Response): Promise<StrikeOperationResponseDto> {
    const result = await this.strikes.manual((await this.users.byTelegram(params.telegramId))._id, body.type, body.amount, body.reason, headers.key);
    if (isRepeatedResult(result)) {
      response.status(200);
    }
    response.setHeader('Location', `/api/owner/users/${params.telegramId}/strike-operations`);
    return result;
  }
}
