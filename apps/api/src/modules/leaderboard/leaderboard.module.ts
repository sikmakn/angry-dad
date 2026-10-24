import { UserLeaderboardController } from './controllers/user-leaderboard.controller';
import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
@Module({
  controllers: [UserLeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {
}
