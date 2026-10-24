import { isRepeatedResult } from '../../../common/utils/idempotency-result';
import { ApiIdempotencyKey, locationHeaders } from '../../../openapi/response-metadata';
import { Controller, Get, Post, Body, Query, Param, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IdempotencyHeader } from '../../../common/utils/idempotency-header';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { BattleService } from '../../battle/battle.service';
import { GetBattleDialogParamsDto } from '../dto/get-battle-dialog-params.dto';
import { BattleDialogResponseDto } from '../../battle/dto/battle-dialog-response.dto';
import { ListBattleMessagesQueryDto } from '../dto/list-battle-messages-query.dto';
import { ListBattleMessagesParamsDto } from '../dto/list-battle-messages-params.dto';
import { BattleMessageListResponseDto } from '../../battle/dto/battle-message-list-response.dto';
import { CreateBattleMessageRequestDto } from '../../battle/dto/create-battle-message-request.dto';
import { CreateBattleMessageParamsDto } from '../dto/create-battle-message-params.dto';
import { CreateBattleMessageHeadersDto } from '../dto/create-battle-message-headers.dto';
import { TurnResponseDto } from '../../battle/dto/turn-response.dto';
import { CreateBattleQuoteRequestDto } from '../../battle/dto/create-battle-quote-request.dto';
import { CreateBattleQuoteParamsDto } from '../dto/create-battle-quote-params.dto';
import { CreateBattleQuoteHeadersDto } from '../dto/create-battle-quote-headers.dto';
import { BattleMessageResponseDto } from '../../battle/dto/battle-message-response.dto';
@ApiTags('battle')
@Controller()
export class UserBattleController {
  constructor(private readonly battle: BattleService) { }
  @Get('battle/:role')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getBattleDialog',
    summary: 'Диалог боя',
  })
  @ApiResponse({
    status: 409,
    description: 'role_mismatch: доступен только диалог текущей роли пользователя',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Диалог',
    type: BattleDialogResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async getBattleDialog(
    @Req()
    request: AuthRequest,
    @Param()
    params: GetBattleDialogParamsDto): Promise<BattleDialogResponseDto> {
    return this.battle.getDialog(request.user, params.role);
  }

  @Get('battle/:role/messages')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listBattleMessages',
    summary: 'Реплики диалога',
  })
  @ApiResponse({
    status: 409,
    description: 'role_mismatch: доступен только диалог текущей роли пользователя',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница реплик',
    type: BattleMessageListResponseDto,
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
  async listBattleMessages(
    @Req()
    request: AuthRequest,
    @Query()
    query: ListBattleMessagesQueryDto,
    @Param()
    params: ListBattleMessagesParamsDto): Promise<BattleMessageListResponseDto> {
    return this.battle.messages(request.user, params.role, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Post('battle/:role/messages')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createBattleMessage',
    summary: 'Сделать ход',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: CreateBattleMessageRequestDto })
  @ApiIdempotencyKey(true, 'turn')
  @ApiResponse({
    status: 200,
    description: 'Повтор того же ключа, прежний результат',
    type: TurnResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Ход засчитан',
    headers: locationHeaders('/api/battle/{role}/messages'),
    type: TurnResponseDto,
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
    status: 409,
    description: 'Conflict',
  })
  @ApiResponse({
    status: 502,
    description: 'BadGateway',
  })
  async createBattleMessage(
    @Req()
    request: AuthRequest,
    @Body()
    body: CreateBattleMessageRequestDto,
    @Param()
    params: CreateBattleMessageParamsDto,
    @IdempotencyHeader()
    headers: CreateBattleMessageHeadersDto,
    @Res({ passthrough: true })
    response: Response): Promise<TurnResponseDto> {
    const result = await this.battle.turn(request.user, params.role, body.text, headers.key!);
    response.status(result.repeated ? 200 : 201);
    if (!result.repeated) {
      response.setHeader('Location', `/api/battle/${params.role}/messages`);
    }
    return result.result;
  }

  @Post('battle/:role/quotes')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createBattleQuote',
    summary: '«Ответить» на сообщение персонажа',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: CreateBattleQuoteRequestDto })
  @ApiIdempotencyKey(false, 'quote')
  @ApiResponse({
    status: 200,
    description: 'Идентичный повтор, прежняя реплика',
    type: BattleMessageResponseDto,
    headers: locationHeaders('/api/battle/{role}/messages'),
  })
  @ApiResponse({
    status: 409,
    description: 'role_mismatch или idempotency_key_reused',
  })
  @ApiResponse({
    status: 201,
    description: 'Реплика добавлена',
    headers: locationHeaders('/api/battle/{role}/messages'),
    type: BattleMessageResponseDto,
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
  async createBattleQuote(
    @Req()
    request: AuthRequest,
    @Body()
    body: CreateBattleQuoteRequestDto,
    @Param()
    params: CreateBattleQuoteParamsDto,
    @IdempotencyHeader()
    headers: CreateBattleQuoteHeadersDto,
    @Res({ passthrough: true })
    response: Response): Promise<BattleMessageResponseDto> {
    const result = await this.battle.quote(request.user, params.role, body.feedMessageId, headers.key);
    if (isRepeatedResult(result)) {
      response.status(200);
    }
    response.setHeader('Location', `/api/battle/${params.role}/messages`);
    return result;
  }
}
