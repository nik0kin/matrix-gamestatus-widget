// LoL specific
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
async function getCurrentGameInfoBySummoner(
  apiKey: string,
  encryptedSummonerId: string,
  regionId: string
) {
  const baseUrl = `https://${regionId}.api.riotgames.com`;
  const url = `${baseUrl}/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}?key=${apiKey}`;
  const response = await fetch(url);
  return (await response.json()) as CurrentGameInfo;
}

// We can only determine if the summoner is playing LoL (TFT is not considered),
//   and we cannot tell if they are only but not playing a game
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
