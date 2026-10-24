import { Controller, Get, Put, Body, Query, Param, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { DeliveryService } from '../../delivery/delivery.service';
import { PhrasesService } from '../../phrases/phrases.service';
import { ListFeedQueryDto } from '../dto/list-feed-query.dto';
import { FeedListResponseDto } from '../../delivery/dto/feed-list-response.dto';
import { RateFeedMessageRequestDto } from '../../phrases/dto/rate-feed-message-request.dto';
import { RateFeedMessageParamsDto } from '../dto/rate-feed-message-params.dto';
import { FeedMessageResponseDto } from '../../delivery/dto/feed-message-response.dto';
import { CheckInAnswerRequestDto } from '../../tasks/dto/check-in-answer-request.dto';
import { AnswerCheckInParamsDto } from '../dto/answer-check-in-params.dto';
import { PeriodActionResponseDto } from '../../tasks/dto/period-action-response.dto';
@ApiTags('delivery')
@Controller()
export class UserDeliveryController {
  constructor(private readonly delivery: DeliveryService, private readonly phrases: PhrasesService) { }
  @Get('feed')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listFeed',
    summary: '«История»',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница ленты',
    type: FeedListResponseDto,
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
  async listFeed(
    @Req()
    request: AuthRequest,
    @Query()
    query: ListFeedQueryDto): Promise<FeedListResponseDto> {
    return this.delivery.list(request.user._id, {
      limit: query.limit,
      cursor: query.cursor,
      periodId: query.periodId,
      category: query.category,
    });
  }

  @Put('feed/:feedMessageId/rating')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'rateFeedMessage',
    summary: 'Оценить фразу',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: RateFeedMessageRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Оценка записана',
    type: FeedMessageResponseDto,
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
  async rateFeedMessage(
    @Req()
    request: AuthRequest,
    @Body()
    body: RateFeedMessageRequestDto,
    @Param()
    params: RateFeedMessageParamsDto): Promise<FeedMessageResponseDto> {
    await this.phrases.rate(request.user._id, params.feedMessageId, body.score);
    return this.delivery.get(request.user._id, params.feedMessageId);
  }

  @Put('feed/:feedMessageId/check-in-answer')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'answerCheckIn',
    summary: 'Ответить на проверку',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: CheckInAnswerRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Ответ принят',
    type: PeriodActionResponseDto,
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
  async answerCheckIn(
    @Req()
    request: AuthRequest,
    @Body()
    body: CheckInAnswerRequestDto,
    @Param()
    params: AnswerCheckInParamsDto): Promise<PeriodActionResponseDto> {
    return this.delivery.answer(request.user, params.feedMessageId, body.answer);
  }
}
