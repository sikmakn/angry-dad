import { Controller, Get, Post, Patch, Delete, Body, Query, Param, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { TasksService } from '../../tasks/tasks.service';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto';
import { TaskListResponseDto } from '../../tasks/dto/task-list-response.dto';
import { CreateTaskRequestDto } from '../../tasks/dto/create-task-request.dto';
import { TaskActionResponseDto } from '../../tasks/dto/task-action-response.dto';
import { GetTaskParamsDto } from '../dto/get-task-params.dto';
import { TaskResponseDto } from '../../tasks/dto/task-response.dto';
import { UpdateTaskRequestDto } from '../../tasks/dto/update-task-request.dto';
import { UpdateTaskParamsDto } from '../dto/update-task-params.dto';
import { DeleteTaskParamsDto } from '../dto/delete-task-params.dto';
import { ReplyResponseDto } from '../../users/dto/reply-response.dto';
import { ListTaskPeriodsQueryDto } from '../dto/list-task-periods-query.dto';
import { ListTaskPeriodsParamsDto } from '../dto/list-task-periods-params.dto';
import { PeriodListResponseDto } from '../../tasks/dto/period-list-response.dto';
import { CompletePeriodParamsDto } from '../dto/complete-period-params.dto';
import { PeriodActionResponseDto } from '../../tasks/dto/period-action-response.dto';
import { ExtendPeriodParamsDto } from '../dto/extend-period-params.dto';
import { ExtendPeriodRequestDto } from '../dto/extend-period-request.dto';
import { SurrenderPeriodParamsDto } from '../dto/surrender-period-params.dto';
import { RetryPeriodParamsDto } from '../dto/retry-period-params.dto';
import { locationHeaders } from '../../../openapi/response-metadata';
@ApiTags('tasks')
@Controller()
export class UserTasksController {
  constructor(private readonly tasks: TasksService) { }
  @Get('tasks')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listTasks',
    summary: 'Мои задачи',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница задач',
    type: TaskListResponseDto,
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
  async listTasks(
    @Req()
    request: AuthRequest,
    @Query()
    query: ListTasksQueryDto): Promise<TaskListResponseDto> {
    return this.tasks.list(request.user._id, {
      limit: query.limit,
      cursor: query.cursor,
      status: query.status,
      kind: query.kind,
      sort: query.sort,
    });
  }

  @Post('tasks')
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createTask',
    summary: 'Поставить задачу',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: CreateTaskRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Задача создана',
    headers: locationHeaders('/api/tasks/{taskId}'),
    type: TaskActionResponseDto,
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
  async createTask(
    @Req()
    request: AuthRequest,
    @Body()
    body: CreateTaskRequestDto,
    @Res({ passthrough: true })
    response: Response): Promise<TaskActionResponseDto> {
    const result = await this.tasks.create(request.user, {
      title: body.title,
      kind: body.kind,
      deadline: body.deadline,
      recurrence: body.recurrence,
      anchorTime: body.anchorTime,
    });
    response.setHeader('Location', `/api/tasks/${result.task.id}`);
    return result;
  }

  @Get('tasks/:taskId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getTask',
    summary: 'Задача',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Задача',
    type: TaskResponseDto,
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
  async getTask(
    @Req()
    request: AuthRequest,
    @Param()
    params: GetTaskParamsDto): Promise<TaskResponseDto> {
    return this.tasks.view(await this.tasks.get(request.user._id, params.taskId));
  }

  @Patch('tasks/:taskId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'updateTask',
    summary: 'Переименовать или остановить задачу',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: UpdateTaskRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Обновлённая задача',
    type: TaskActionResponseDto,
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
  async updateTask(
    @Req()
    request: AuthRequest,
    @Body()
    body: UpdateTaskRequestDto,
    @Param()
    params: UpdateTaskParamsDto): Promise<TaskActionResponseDto> {
    return this.tasks.update(request.user, params.taskId, {
      title: body.title,
      status: body.status,
    });
  }

  @Delete('tasks/:taskId')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'deleteTask',
    summary: 'Удалить задачу',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Задача удалена',
    type: ReplyResponseDto,
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
  async deleteTask(
    @Req()
    request: AuthRequest,
    @Param()
    params: DeleteTaskParamsDto): Promise<ReplyResponseDto> {
    return this.tasks.delete(request.user, params.taskId);
  }

  @Get('tasks/:taskId/periods')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'listTaskPeriods',
    summary: 'Периоды задачи',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Страница периодов',
    type: PeriodListResponseDto,
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
  async listTaskPeriods(
    @Req()
    request: AuthRequest,
    @Query()
    query: ListTaskPeriodsQueryDto,
    @Param()
    params: ListTaskPeriodsParamsDto): Promise<PeriodListResponseDto> {
    return this.tasks.listPeriods(request.user._id, params.taskId, {
      limit: query.limit,
      cursor: query.cursor,
    });
  }

  @Post('periods/:periodId/completion')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'completePeriod',
    summary: '«Готово»',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Период закрыт',
    type: PeriodActionResponseDto,
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
  async completePeriod(
    @Req()
    request: AuthRequest,
    @Param()
    params: CompletePeriodParamsDto): Promise<PeriodActionResponseDto> {
    return this.tasks.action(request.user, params.periodId, 'done');
  }

  @Post('periods/:periodId/extension')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'extendPeriod',
    summary: 'Попросить больше времени',
  })
  @ApiBody({
    type: ExtendPeriodRequestDto,
    required: false,
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Срок продлён',
    type: PeriodActionResponseDto,
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
  async extendPeriod(
    @Req()
    request: AuthRequest,
    @Body()
    body: ExtendPeriodRequestDto,
    @Param()
    params: ExtendPeriodParamsDto): Promise<PeriodActionResponseDto> {
    return this.tasks.action(request.user, params.periodId, 'extend', 'done_button', undefined, body?.deadline);
  }

  @Post('periods/:periodId/surrender')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'surrenderPeriod',
    summary: '«Сдаюсь»',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Период провален',
    type: PeriodActionResponseDto,
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
  async surrenderPeriod(
    @Req()
    request: AuthRequest,
    @Param()
    params: SurrenderPeriodParamsDto): Promise<PeriodActionResponseDto> {
    return this.tasks.action(request.user, params.periodId, 'surrender');
  }

  @Post('periods/:periodId/retry')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'retryPeriod',
    summary: '«Сделаю за час»',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Период снова активен',
    type: PeriodActionResponseDto,
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
  async retryPeriod(
    @Req()
    request: AuthRequest,
    @Param()
    params: RetryPeriodParamsDto): Promise<PeriodActionResponseDto> {
    return this.tasks.action(request.user, params.periodId, 'retry');
  }
}
