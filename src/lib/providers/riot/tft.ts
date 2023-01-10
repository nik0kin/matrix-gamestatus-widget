import pkg from 'lodash';
const { isArray, memoize } = pkg;

async function getTFTMatchIdsByPuuid(apiKey: string, puuid: string, regionId: string, count = 20) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${apiKey}&count=${count}`;
  const response = await fetch(url);
  console.log('fetching ' + url);
  const data = (await response.json()) as string[];

  if (!data || !isArray(data)) {
    const errorMsg = 'Bad getTFTMatchIdsByPuuid() response';
    console.error(errorMsg, data);
    throw new Error(errorMsg);
  }

  return data;
}

interface TFTParticipantDto {
  augments: string[];
  companion: {
    content_ID: string;
    skin_ID: number;
    species: string;
  };
  gold_left: number;
  last_round: number;
  level: number;
  placement: number;
  players_eliminated: number;
  puuid: string;
  time_eliminated: number;
  total_damage_to_players: number;
  traits: Array<{
    name: string;
    num_units: number;
    style: number;
    tier_current: number;
    tier_total: number;
  }>;
  units: Array<{
    character_id: string;
    chosen?: string;
    itemNames: string[];
    items: number[];
    name: string;
    rarity: number;
    tier: number;
  }>;
}

interface TFTMatchDto {
  metadata: {
    data_version: string;
    match_id: string;
    participants: string[]; // puuid
  };
  info: {
    game_datetime: number; // unix ts
    game_length: number;
    game_version: string;
    participants: TFTParticipantDto[];
    queue_id: number;
    tft_game_type: string; // 'standard',
    tft_set_core_name: string;
    tft_set_number: number;
  };
}

async function getMatchById(apiKey: string, matchId: string, regionId: string) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/tft/match/v1/matches/${matchId}?api_key=${apiKey}`;
  const response = await fetch(url);
  console.log('fetching ' + url);
  const payload = (await response.json()) as TFTMatchDto;
  if (!payload.info) throw new Error('Issue with payload: ' + JSON.stringify(payload));
  return payload;
}
const memo_getMatchById = memoize(
  getMatchById,
  (apiKey, matchId, regionId) => apiKey + matchId + regionId
);

export async function getLastTFTMatches(
  apiKey: string,
  puuid: string,
  regionId: string,
  count: number
) {
  const matchIds = await getTFTMatchIdsByPuuid(apiKey, puuid, regionId, count);
  const matches: TFTMatchDto[] = [];

  // 1 by 1 to ease rate limiting
  for (const id of matchIds) {
    matches.push(await memo_getMatchById(apiKey, id, regionId));
  }

  return matches;
}

export function getGameString(match: TFTMatchDto) {
  return getQueueName(match.info.tft_game_type, match.info.queue_id) + ' TFT';
}

export function getMatchHistoryString(puuid: string, match: TFTMatchDto) {
  const participant = match.info.participants.find((p) => p.puuid === puuid);

  if (!participant) throw new Error('missing participant in match ' + puuid);

  const highLevelTraits = participant.traits.filter((t) => t.tier_current > 0);
  const traits = highLevelTraits
    .map((t) => `${t.name.replace('Set7_', '')}: ${t.num_units}`)
    .join(', ');
  const augments = participant.augments
    .map((a) => a.replace('TFT6_Augment_', '').replace('TFT7_Augment_', ''))
    .join(', ');
  return `Placement: ${participant.placement} - ${traits} - ${augments}`;
}

function getQueueName(gameType: string, queueId: number) {
  switch (queueId) {
    case 1090:
      return 'Normal';
    case 1100:
      return 'Ranked';
    case 1130:
      return 'Hyper Roll';
    default:
      return `${gameType} ${queueId}`;
  }
}
