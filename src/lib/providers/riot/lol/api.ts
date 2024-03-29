import pkg from 'lodash';
const { memoize, isArray } = pkg;

interface LoLGameInfoParticipant {
  teamId: number;
  spell1Id: number;
  spell2Id: number;
  championId: number;
  profileIconId: number;
  summonerName: string;
  bot: boolean;
  summonerId: string;
  gameCustomizationObjects: unknown[];
  perks: {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
  };
}

interface CurrentGameInfo {
  gameId: number;
  mapId: number;
  gameMode: string; // ARAM
  gameType: string; // MATCHED_GAME
  gameQueueConfigId: number;
  participants: LoLGameInfoParticipant[];
  observers: {
    encryptionKey: string;
  };
  platformId: string;
  bannedChampions: unknown[];
  gameStartTime: number;
  gameLength: number;
}

// 404 if offline?
export async function getCurrentGameInfoBySummoner(
  apiKey: string,
  encryptedSummonerId: string,
  regionId: string
) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}?api_key=${apiKey}`;
  const response = await fetch(url);
  console.log('fetching ' + url);
  const responseJson = await response.json();

  if (!responseJson.gameId) {
    throw new Error(responseJson.status);
  }

  return responseJson as CurrentGameInfo;
}

export async function getLoLMatchIdsByPuuid(
  apiKey: string,
  puuid: string,
  regionId: string,
  count = 20
) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${apiKey}&count=${count}`;
  const response = await fetch(url);
  console.log('fetching ' + url);
  const data = (await response.json()) as string[];

  if (!data || !isArray(data)) {
    const errorMsg = 'Bad getLoLMatchIdsByPuuid() response';
    console.error(errorMsg, data);
    throw new Error(errorMsg);
  }

  return data;
}

interface LoLParticipantDto {
  puuid: string;
  assists: number;
  championName: string;
  deaths: number;
  goldEarned: number;
  item0: number; // id
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  kills: number;
  totalMinionsKilled: number;
  win: boolean;
  // incomplete typing
}

export interface LoLMatchDto {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[]; // puuid
  };
  info: {
    gameCreation: number; // unix ts
    gameDuration: number; // ms
    gameStartTimestamp: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string; // enum?
    gameName: string;
    gameType: string;
    gameVersion: string;
    mapId: number; // enum?
    participants: LoLParticipantDto[];
    platformId: string;
    queueId: number;
    teams: unknown[]; // TeamDto[]
    tournamentCode: string;
  };
}

async function _getMatchById(apiKey: string, matchId: string, regionId: string) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
  const response = await fetch(url);
  console.log('fetching ' + url);
  const payload = (await response.json()) as LoLMatchDto;

  if (!payload.info) throw new Error('Issue with payload: ' + JSON.stringify(payload));
  return payload;
}
export const getMatchById = memoize(
  _getMatchById,
  (apiKey, matchId, regionId) => apiKey + matchId + regionId
);
