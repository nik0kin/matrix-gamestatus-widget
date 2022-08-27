import { formatNumber } from '$lib/utils/format-number';
import {
  getCurrentGameInfoBySummoner,
  getLoLMatchIdsByPuuid,
  getMatchById,
  type LoLMatchDto,
} from './api';

// We can only determine if the summoner is playing LoL (TFT is not considered),
//   and we cannot tell if they are online but not playing a game
export async function getSummonerStatus(
  apiKey: string,
  encryptedSummonerId: string,
  regionId: string
) {
  try {
    const currentGameInfo = await getCurrentGameInfoBySummoner(
      apiKey,
      encryptedSummonerId,
      regionId
    );
    return currentGameInfo.gameMode + ' ' + currentGameInfo.gameType;
  } catch (e) {
    return 'Unknown';
  }
}

export async function getLastLoLMatches(
  apiKey: string,
  puuid: string,
  regionId: string,
  count: number
) {
  const matchIds = await getLoLMatchIdsByPuuid(apiKey, puuid, regionId, count);
  const matches: LoLMatchDto[] = [];

  // 1 by 1 to ease rate limiting
  for (const id of matchIds) {
    matches.push(await getMatchById(apiKey, id, regionId));
  }

  return matches;
}

export function getGameString(match: LoLMatchDto) {
  return `LoL - ${match.info.gameMode}`;
}

export function getMatchHistoryString(puuid: string, match: LoLMatchDto) {
  const participant = match.info.participants.find((p) => p.puuid === puuid);

  if (!participant) throw new Error('missing participant in match ' + puuid);

  return `${participant.win ? 'Win' : 'Lose'} - ${participant.championName} - K/D/A: ${
    participant.kills
  }/${participant.deaths}/${participant.assists} - ${
    participant.totalMinionsKilled
  } minions killed - ${formatNumber(participant.goldEarned)} gold earned`;
}
