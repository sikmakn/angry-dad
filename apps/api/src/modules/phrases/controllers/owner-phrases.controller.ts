import { Controller, Get, Post, Patch, Body, Query, Param, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import { OwnerGuard } from '../../users/guards/owner.guard';
import { PhrasesService } from '../../phrases/phrases.service';
import { ListOwnerPhrasesQueryDto } from '../dto/list-owner-phrases-query.dto';
import { PhraseListResponseDto } from '../../phrases/dto/phrase-list-response.dto';
import { CreatePhraseRequestDto } from '../../phrases/dto/create-phrase-request.dto';
import { PhraseResponseDto } from '../../phrases/dto/phrase-response.dto';
import { UpdatePhraseRequestDto } from '../../phrases/dto/update-phrase-request.dto';
import { UpdateOwnerPhraseParamsDto } from '../dto/update-owner-phrase-params.dto';
import { CreateParaphrasesRequestDto } from '../../payments/dto/create-paraphrases-request.dto';
import { CreateOwnerParaphrasesParamsDto } from '../dto/create-owner-paraphrases-params.dto';
import { PhraseItemsResponseDto } from '../../phrases/dto/phrase-items-response.dto';
import { PhraseCoverageResponseDto } from '../../phrases/dto/phrase-coverage-response.dto';
import { locationHeaders } from '../../../openapi/response-metadata';
@ApiTags('phrases')
@Controller()
export class OwnerPhrasesController {
  constructor(private readonly phrases: PhrasesService) { }
  @Get('owner/phrases')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listOwnerPhrases',
    summary: 'Владелец. Пул фраз',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница фраз',
    type: PhraseListResponseDto,
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
  async listOwnerPhrases(
    @Query()
    query: ListOwnerPhrasesQueryDto): Promise<PhraseListResponseDto> {
    return this.phrases.list({
      limit: query.limit,
      cursor: query.cursor,
      role: query.role,
      category: query.category,
      status: query.status,
      belowThreshold: query.belowThreshold,
      sort: query.sort,
    });
  }

  @Post('owner/phrases')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createOwnerPhrase',
    summary: 'Владелец. Добавить фразу',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: CreatePhraseRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Фраза добавлена',
    headers: locationHeaders('/api/owner/phrases/{phraseId}'),
    type: PhraseResponseDto,
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
  async createOwnerPhrase(
    @Body()
    body: CreatePhraseRequestDto,
    @Res({ passthrough: true })
    response: Response): Promise<PhraseResponseDto> {
    const result = await this.phrases.create({
      role: body.role,
      category: body.category,
      level: body.level,
      defeatLevel: body.defeatLevel,
      combo: body.combo,
      template: body.template,
      source: body.source,
      author: body.author,
    });
    response.setHeader('Location', `/api/owner/phrases/${result.id}`);
    return result;
  }

  @Patch('owner/phrases/:phraseId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'updateOwnerPhrase',
    summary: 'Владелец. Включить, выключить, одобрить перефраз',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: UpdatePhraseRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Фраза обновлена',
    type: PhraseResponseDto,
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
  async updateOwnerPhrase(
    @Body()
    body: UpdatePhraseRequestDto,
    @Param()
    params: UpdateOwnerPhraseParamsDto): Promise<PhraseResponseDto> {
    return this.phrases.setStatus(params.phraseId, body.status);
  }

  @Post('owner/phrases/:phraseId/paraphrases')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createOwnerParaphrases',
    summary: 'Владелец. Создать перефразы',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiBody({ type: CreateParaphrasesRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Перефразы созданы',
    headers: locationHeaders('/api/owner/phrases'),
    type: PhraseItemsResponseDto,
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
    status: 503,
    description: 'ServiceUnavailable',
  })
  async createOwnerParaphrases(
    @Body()
    body: CreateParaphrasesRequestDto,
    @Param()
    params: CreateOwnerParaphrasesParamsDto,
    @Res({ passthrough: true })
    response: Response): Promise<PhraseItemsResponseDto> {
    const result = await this.phrases.paraphrases(params.phraseId);
    response.setHeader('Location', '/api/owner/phrases');
    return result;
  }

  @Get('owner/phrase-coverage')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getOwnerPhraseCoverage',
    summary: 'Владелец. Отчёт наполнения пула',
  })
  @UseGuards(TelegramAuthGuard, OwnerGuard)
  @ApiResponse({
    status: 200,
    description: 'Отчёт',
    type: PhraseCoverageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async getOwnerPhraseCoverage(): Promise<PhraseCoverageResponseDto> {
    return this.phrases.coverage();
  }
}
