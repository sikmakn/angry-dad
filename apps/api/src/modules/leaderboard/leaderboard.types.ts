export type LeaderboardEntryView = {
  rank: number;
  username?: string;
  firstName?: string;
  closedCount: number;
};
export type LeaderboardMeView = {
  rank?: number | null;
  closedCount: number;
  inLeaderboard: boolean;
};
export type LeaderboardResponseView = {
  items: (LeaderboardEntryView)[];
  me: LeaderboardMeView;
};
export type LeaderboardParticipationRequestView = {
  inLeaderboard: boolean;
};
export type LeaderboardParticipationResponseView = {
  inLeaderboard: boolean;
};
