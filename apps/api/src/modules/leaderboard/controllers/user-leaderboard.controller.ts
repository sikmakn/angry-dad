import { Controller, Get, Put, Body, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { TelegramAuthGuard } from '../../users/guards/telegram-auth.guard';
import type { AuthRequest } from '../../users/guards/telegram-auth.guard';
import { OnboardedGuard } from '../../users/guards/onboarded.guard';
import { LeaderboardService } from '../../leaderboard/leaderboard.service';
import { LeaderboardParticipationRequestDto } from '../../leaderboard/dto/leaderboard-participation-request.dto';
import { LeaderboardParticipationResponseDto } from '../../leaderboard/dto/leaderboard-participation-response.dto';
import { LeaderboardResponseDto } from '../../leaderboard/dto/leaderboard-response.dto';
@ApiTags('leaderboard')
@Controller()
export class UserLeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) { }
  @Put('me/leaderboard-participation')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'setLeaderboardParticipation',
    summary: 'Участие в рейтинге',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiBody({ type: LeaderboardParticipationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Новое состояние',
    type: LeaderboardParticipationResponseDto,
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
  async setLeaderboardParticipation(
    @Req()
    request: AuthRequest,
    @Body()
    body: LeaderboardParticipationRequestDto): Promise<LeaderboardParticipationResponseDto> {
    return this.leaderboard.participate(request.user._id, body.inLeaderboard);
  }

  @Get('leaderboard')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'getLeaderboard',
    summary: 'Рейтинг',
  })
  @UseGuards(TelegramAuthGuard, OnboardedGuard)
  @ApiResponse({
    status: 200,
    description: 'Рейтинг',
    type: LeaderboardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async getLeaderboard(
    @Req()
    request: AuthRequest): Promise<LeaderboardResponseDto> {
    return this.leaderboard.get(request.user);
  }
}
