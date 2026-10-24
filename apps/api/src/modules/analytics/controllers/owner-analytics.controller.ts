import { Controller, Get, Put, Body, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { AnalyticsService } from '../../analytics/analytics.service';
import { GetOwnerMetricsQueryDto } from '../dto/get-owner-metrics-query.dto';
import { MetricsResponseDto } from '../../analytics/dto/metrics-response.dto';
import { ListOwnerJournalQueryDto } from '../dto/list-owner-journal-query.dto';
import { OwnerJournalListResponseDto } from '../../analytics/dto/owner-journal-list-response.dto';
import { GameSettingsResponseDto } from '../../analytics/dto/game-settings-response.dto';
import { GameSettingsRequestDto } from '../../analytics/dto/game-settings-request.dto';
@ApiTags('analytics')
@Controller()
export class OwnerAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) { }
  @Get('owner/metrics')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerMetrics',
    summary: 'Владелец. Метрики за период',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Метрики',
    type: MetricsResponseDto,
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
  async getOwnerMetrics(
    @Query()
    query: GetOwnerMetricsQueryDto): Promise<MetricsResponseDto> {
    return this.analytics.metrics(query.from!, query.to!);
  }

  @Get('owner/journal')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerJournal',
    summary: 'Владелец. Журнал действий',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница журнала',
    type: OwnerJournalListResponseDto,
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
  async listOwnerJournal(
    @Query()
    query: ListOwnerJournalQueryDto): Promise<OwnerJournalListResponseDto> {
    return this.analytics.listJournal({
      limit: query.limit,
      cursor: query.cursor,
      action: query.action,
    });
  }

  @Get('owner/game-settings')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerGameSettings',
    summary: 'Владелец. Настройки игры',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Настройки',
    type: GameSettingsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async getOwnerGameSettings(): Promise<GameSettingsResponseDto> {
    return this.analytics.getSettings();
  }

  @Put('owner/game-settings')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'replaceOwnerGameSettings',
    summary: 'Владелец. Заменить настройки игры',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: GameSettingsRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Настройки сохранены',
    type: GameSettingsResponseDto,
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
  async replaceOwnerGameSettings(
    @Body()
    body: GameSettingsRequestDto): Promise<GameSettingsResponseDto> {
    return this.analytics.replaceSettings({
      battleCoefficients: body.battleCoefficients,
      aiDailyLimit: body.aiDailyLimit,
      otherNames: body.otherNames,
      banditParams: body.banditParams,
    });
  }
}
