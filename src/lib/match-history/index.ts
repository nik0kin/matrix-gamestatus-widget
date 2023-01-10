import type { CommonMatchHistory } from '$lib/common-game-status';

import { getLoLMatches, getTFTMatches, getPubgMatches } from './transform-n-cache';

const matchHistoryProviders: Record<string, [() => Promise<CommonMatchHistory[]>, string]> = {
  'league-of-legends': [getLoLMatches, 'riotgames'],
  'team-fight-tactics': [getTFTMatches, 'riotgames'],
  pubg: [getPubgMatches, 'pubg'],
};

export const getMatchHistoriesResponse = async (): Promise<
  [CommonMatchHistory[], string[], string[]]
> => {
  let matchHistories: CommonMatchHistory[] = [];
  const apisUsed: string[] = [];
  const providerErrors: string[] = [];

  // Fetch match historys one game at a time
  for (const matchHistoryProvider of Object.entries(matchHistoryProviders)) {
    const [gameKey, [getMatches, apiName]] = matchHistoryProvider;
    try {
      const matches = await getMatches();

      if (matches.length) {
        matchHistories = matchHistories.concat(matches);
        apisUsed.push(apiName);
      }
    } catch (e) {
      // TODO add option for stacktraces
      const errorMsg = `${gameKey} getMatches() error: ${
        e instanceof Error ? e.message : JSON.stringify(e, Object.getOwnPropertyNames(e))
      }`;
      console.error(errorMsg);
      providerErrors.push(errorMsg);
    }
  }
  return [matchHistories, apisUsed, providerErrors];
};
