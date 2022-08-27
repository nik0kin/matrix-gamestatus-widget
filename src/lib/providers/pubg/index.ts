import { formatNumber } from '$lib/utils/format-number';
import { getMapName, getMatchById, getPlayersByPlayerNames, type GetMatchResponse } from './api';

// TODO rate limiting if tracking 10+ players

// returns Promise<Array<[playerId, playerName, match]>>
export async function getRecentPubgMatches(
  apiKey: string,
  type: 'playerIds' | 'playerNames',
  playerIdsOrPlayerNames: string[],
  platform: string
) {
  const playersResponse = await getPlayersByPlayerNames(
    apiKey,
    type,
    playerIdsOrPlayerNames,
    platform
  );
  const playerAndMatchIds = playersResponse.data.flatMap((player) =>
    // TODO filter out non normal game matches? (training?)
    player.relationships.matches.data.map((d) => [player.id, player.attributes.name, d.id] as const)
  );
  const uniqueMatchIds = [...new Set(playerAndMatchIds.map(([, , mId]) => mId))];

  const matchPromises = await Promise.all([
    ...uniqueMatchIds.map((mId) => getMatchById(mId, platform)),
  ]);
  const matchesById = matchPromises.reduce<Record<string, GetMatchResponse>>((acc, m) => {
    acc[m.data.id] = m;
    return acc;
  }, {});

  return playerAndMatchIds.map(([pId, pName, mId]) => [pId, pName, matchesById[mId]] as const);
}

export function getGameString(match: GetMatchResponse) {
  const matchType =
    match.data.attributes.matchType !== 'official' ? match.data.attributes.matchType : '';
  return `PUBG - ${getMapName(match.data.attributes.mapName)} ${matchType}`;
}

export function getMatchHistoryString(playerId: string, match: GetMatchResponse) {
  const participant = match.included.find(
    (a) => a.type === 'participant' && a.attributes.stats.playerId === playerId
  );
  if (!participant) {
    throw new Error(`Missing matchHistory for playerId=${playerId}`);
  }

  const { rideDistance, swimDistance, walkDistance } = participant.attributes.stats;
  const distanceTraveled = rideDistance + swimDistance + walkDistance;

  return `#${participant.attributes.stats.winPlace}/${
    match.data.relationships.rosters.data.length
  } - ${participant.attributes.stats.kills} kills - ${formatNumber(
    participant.attributes.stats.damageDealt,
    1
  )} damage - ${formatNumber(distanceTraveled / 1000, 2)} km`;
}
