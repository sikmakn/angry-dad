import { isRepeatedResult } from '../../../common/utils/idempotency-result';
import { ApiIdempotencyKey, locationHeaders } from '../../../openapi/response-metadata';
import { Controller, Get, Post, Param, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IdempotencyHeader } from '../../../common/utils/idempotency-header';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { PaymentsService } from '../../payments/payments.service';
import { PackageListResponseDto } from '../../payments/dto/package-list-response.dto';
import { CreateInvoiceParamsDto } from '../dto/create-invoice-params.dto';
import { CreateInvoiceHeadersDto } from '../dto/create-invoice-headers.dto';
import { InvoiceResponseDto } from '../../payments/dto/invoice-response.dto';
@ApiTags('payments')
@Controller()
export class UserPaymentsController {
  constructor(private readonly payments: PaymentsService) { }
  @Get('packages')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listPackages',
    summary: 'Пакеты ударов',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Пакеты',
    type: PackageListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async listPackages(): Promise<PackageListResponseDto> {
    return this.payments.packages();
  }

  @Post('packages/:packageId/invoices')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createInvoice',
    summary: 'Создать счёт Stars',
  })
  @ApiIdempotencyKey(false, 'financial')
  @ApiResponse({
    status: 200,
    description: 'Идентичный повтор, прежний счёт',
    type: InvoiceResponseDto,
    headers: locationHeaders('/api/packages/{packageId}'),
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный packageId или заголовок Idempotency-Key',
  })
  @ApiResponse({
    status: 409,
    description: 'idempotency_key_reused: другой пакет с тем же ключом',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 201,
    description: 'Счёт создан',
    headers: locationHeaders('/api/packages/{packageId}'),
    type: InvoiceResponseDto,
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
    status: 503,
    description: 'ServiceUnavailable',
  })
  async createInvoice(
    @Req()
    request: AuthRequest,
    @Param()
    params: CreateInvoiceParamsDto,
    @IdempotencyHeader()
    headers: CreateInvoiceHeadersDto,
    @Res({ passthrough: true })
    response: Response): Promise<InvoiceResponseDto> {
    const result = await this.payments.invoice(request.user, params.packageId, headers.key);
    if (isRepeatedResult(result)) {
      response.status(200);
    }
    response.setHeader('Location', `/api/packages/${params.packageId}`);
    return result;
  }
}
