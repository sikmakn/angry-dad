import { Controller, Get, Post, Put, Patch, Body, Query, Param, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { PaymentsService } from '../../payments/payments.service';
import { OwnerPackageListResponseDto } from '../../payments/dto/owner-package-list-response.dto';
import { OwnerPackageRequestDto } from '../../payments/dto/owner-package-request.dto';
import { OwnerPackageResponseDto } from '../../payments/dto/owner-package-response.dto';
import { ReplaceOwnerPackageParamsDto } from '../dto/replace-owner-package-params.dto';
import { ListOwnerPaymentsQueryDto } from '../dto/list-owner-payments-query.dto';
import { PaymentListResponseDto } from '../../payments/dto/payment-list-response.dto';
import { RefundRequestDto } from '../../payments/dto/refund-request.dto';
import { RefundOwnerPaymentParamsDto } from '../dto/refund-owner-payment-params.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';
import { ListOwnerSupportTicketsQueryDto } from '../dto/list-owner-support-tickets-query.dto';
import { SupportTicketListResponseDto } from '../../payments/dto/support-ticket-list-response.dto';
import { UpdateSupportTicketRequestDto } from '../../payments/dto/update-support-ticket-request.dto';
import { UpdateOwnerSupportTicketParamsDto } from '../dto/update-owner-support-ticket-params.dto';
import { SupportTicketResponseDto } from '../../payments/dto/support-ticket-response.dto';
import { locationHeaders } from '../../../openapi/response-metadata';
@ApiTags('payments')
@Controller()
export class OwnerPaymentsController {
  constructor(private readonly payments: PaymentsService) { }
  @Get('owner/packages')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerPackages',
    summary: 'Владелец. Все пакеты',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Пакеты',
    type: OwnerPackageListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async listOwnerPackages(): Promise<OwnerPackageListResponseDto> {
    return this.payments.ownerPackages();
  }

  @Post('owner/packages')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createOwnerPackage',
    summary: 'Владелец. Добавить пакет',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: OwnerPackageRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Пакет добавлен',
    headers: locationHeaders('/api/owner/packages/{packageId}'),
    type: OwnerPackageResponseDto,
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
  async createOwnerPackage(
    @Body()
    body: OwnerPackageRequestDto,
    @Res({ passthrough: true })
    response: Response): Promise<OwnerPackageResponseDto> {
    const result = await this.payments.createPackage({
      strikes: body.strikes,
      priceStars: body.priceStars,
      active: body.active,
      order: body.order,
    });
    response.setHeader('Location', `/api/owner/packages/${result.id}`);
    return result;
  }

  @Put('owner/packages/:packageId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'replaceOwnerPackage',
    summary: 'Владелец. Заменить пакет',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: OwnerPackageRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Пакет сохранён',
    type: OwnerPackageResponseDto,
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
  async replaceOwnerPackage(
    @Body()
    body: OwnerPackageRequestDto,
    @Param()
    params: ReplaceOwnerPackageParamsDto): Promise<OwnerPackageResponseDto> {
    return this.payments.replacePackage(params.packageId, {
      strikes: body.strikes,
      priceStars: body.priceStars,
      active: body.active,
      order: body.order,
    });
  }

  @Get('owner/payments')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerPayments',
    summary: 'Владелец. Платежи',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница платежей',
    type: PaymentListResponseDto,
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
  async listOwnerPayments(
    @Query()
    query: ListOwnerPaymentsQueryDto): Promise<PaymentListResponseDto> {
    return this.payments.listPayments({
      limit: query.limit,
      cursor: query.cursor,
      telegramId: query.telegramId,
      status: query.status,
    });
  }

  @Post('owner/payments/:paymentId/refund')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'refundOwnerPayment',
    summary: 'Владелец. Вернуть Stars',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: RefundRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Платёж возвращён',
    type: PaymentResponseDto,
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
  @ApiResponse({
    status: 503,
    description: 'ServiceUnavailable',
  })
  async refundOwnerPayment(
    @Body()
    body: RefundRequestDto,
    @Param()
    params: RefundOwnerPaymentParamsDto): Promise<PaymentResponseDto> {
    return this.payments.refund(params.paymentId, body.reason);
  }

  @Get('owner/support-tickets')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerSupportTickets',
    summary: 'Владелец. Обращения /paysupport',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница обращений',
    type: SupportTicketListResponseDto,
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
  async listOwnerSupportTickets(
    @Query()
    query: ListOwnerSupportTicketsQueryDto): Promise<SupportTicketListResponseDto> {
    return this.payments.tickets({
      limit: query.limit,
      cursor: query.cursor,
      status: query.status,
    });
  }

  @Patch('owner/support-tickets/:ticketId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'updateOwnerSupportTicket',
    summary: 'Владелец. Закрыть или открыть обращение',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: UpdateSupportTicketRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Обращение обновлено',
    type: SupportTicketResponseDto,
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
  async updateOwnerSupportTicket(
    @Body()
    body: UpdateSupportTicketRequestDto,
    @Param()
    params: UpdateOwnerSupportTicketParamsDto): Promise<SupportTicketResponseDto> {
    return this.payments.updateTicket(params.ticketId, body.status);
  }
}
