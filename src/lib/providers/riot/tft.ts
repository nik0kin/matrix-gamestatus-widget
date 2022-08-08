import { formatDuration } from '$lib/utils/format-time';

async function getTFTMatchIdsByPuuid(apiKey: string, puuid: string, regionId: string, count = 20) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/tft/match/v1/matches/by-puuid/${puuid}/ids?api_key=${apiKey}&count=${count}`;
  const response = await fetch(url);
  return (await response.json()) as string[];
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
  return (await response.json()) as TFTMatchDto;
}

export async function getLast10TFTMatches(apiKey: string, puuid: string, regionId: string) {
  const matchIds = await getTFTMatchIdsByPuuid(apiKey, puuid, regionId, 10);
  const matches: TFTMatchDto[] = [];

  // 1 by 1 to ease rate limiting
  for (const id of matchIds) {
    matches.push(await getMatchById(apiKey, id, regionId));
  }

  return matches;
}

export function getGameString(match: TFTMatchDto) {
  return getQueueName(match.info.tft_game_type, match.info.queue_id) + ' TFT';
}

export function getMatchHistoryString(puuid: string, match: TFTMatchDto) {
  const participant = match.info.participants.find((p) => p.puuid === puuid);

  if (!participant) throw new Error('missing participant in match ' + puuid);

  return `${formatDuration(match.info.game_length * 1000)} - Placement: ${participant.placement}`;
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
