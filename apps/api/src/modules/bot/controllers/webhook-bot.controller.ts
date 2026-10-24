import { Controller, Post, Body, Req, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags, ApiSecurity } from '@nestjs/swagger';
import type { Request } from 'express';
import { BotService } from '../../bot/bot.service';
import { TelegramUpdateDto } from '../../bot/dto/telegram-update.dto';
import { WebhookAckDto } from '../../bot/dto/webhook-ack.dto';
@ApiTags('bot')
@Controller()
export class WebhookBotController {
  constructor(private readonly bot: BotService) { }
  @Post('telegram/webhook')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'receiveTelegramUpdate',
    summary: 'Вебхук Telegram',
  })
  @ApiBody({ type: TelegramUpdateDto })
  @ApiSecurity('telegramWebhookSecret')
  @ApiResponse({
    status: 400,
    description: 'validation_failed: update_id должен быть неотрицательным безопасным целым числом',
  })
  @ApiResponse({
    status: 200,
    description: 'Обновление обработано или проигнорировано',
    type: WebhookAckDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 503,
    description: 'ServiceUnavailable',
  })
  async receiveTelegramUpdate(
    @Req()
    request: Request,
    @Body()
    body: Record<string, unknown>): Promise<WebhookAckDto> {
    return this.bot.receive(request.header('X-Telegram-Bot-Api-Secret-Token'), body);
  }
}
