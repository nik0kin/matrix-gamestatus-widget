import type { CommonMatchHistory } from '$lib/common-game-status';

export interface GetMatchHistoriesResponse {
  matchHistories: CommonMatchHistory[];
  apisUsed: string[];
  providerErrors?: string[];
}
