export interface GetPlayersResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: {
      name: string;
      shardId: string;
      stats: object;
      createdAt: string;
      updatedAt: string;
      patchVersion: string;
      titleId: string;
    };
    relationships: {
      assets: {
        data: object;
      };
      matches: {
        data: [
          {
            id: string;
            type: string;
          }
        ];
      };
    };
    links: {
      schema: string;
      self: string;
    };
  }>;
  links: {
    self: string;
  };
  meta: object;
}

export interface GetMatchResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      createdAt: string;
      duration: number; // seconds
      matchType: 'official' | 'airoyale'; // ???
      gameMode: 'duo'; // enum?
      mapName: string;
      isCustomMatch: true;
      patchVersion: string;
      seasonState: 'closed'; // enum?
      shardId: string;
      stats: unknown;
      tags: unknown;
      titleId: string;
    };
    relationships: {
      assets: {
        data: [
          {
            type: string;
            id: string;
          }
        ];
      };
      rosters: {
        data: [
          {
            type: string;
            id: string;
          }
        ];
      };
      rounds: unknown;
      spectators: unknown;
    };
    links: {
      schema: string;
      self: string;
    };
  };
  included: Array<Participant>;
  links: {
    self: string;
  };
  meta: unknown;
}

export interface Participant {
  attributes: {
    actor: '';
    shardId: 'steam';
    stats: {
      DBNOs: number;
      assists: number;
      boosts: number;
      damageDealt: number;
      deathType: 'byplayer'; // enum?
      headshotKills: number;
      heals: number;
      killPlace: number;
      killStreaks: number;
      kills: number;
      longestKill: number;
      name: string;
      playerId: string; // starts with account. or ai.
      revives: number;
      rideDistance: number;
      roadKills: number;
      swimDistance: number;
      teamKills: number;
      timeSurvived: number;
      vehicleDestroys: number;
      walkDistance: number;
      weaponsAcquired: number;
      winPlace: number;
    };
  };
  id: string;
  type: 'participant';
}

const getBaseUrl = (platform: string) => `https://api.pubg.com/shards/${platform}`;

export async function getPlayersByPlayerNames(
  apiKey: string,
  type: 'playerIds' | 'playerNames',
  playerIdsOrPlayerNames: string[],
  platform: string
) {
  const url = `${getBaseUrl(platform)}/players?filter[${type}]=${encodeURIComponent(
    playerIdsOrPlayerNames.join(',')
  )}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  console.log('fetching ' + url);
  const payload = (await response.json()) as GetPlayersResponse;
  if (!payload.data) throw new Error('Issue with payload: ' + JSON.stringify(payload));
  return payload;
}

const matchesCache: Record<string, GetMatchResponse> = {};

export async function getMatchById(matchId: string, platform: string) {
  if (matchesCache[matchId]) return matchesCache[matchId];

  const url = `${getBaseUrl(platform)}/matches/${matchId}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.api+json',
    },
  });
  console.log('fetching ' + url);
  const payload = (await response.json()) as GetMatchResponse;
  if (!payload.data) throw new Error('Issue with payload: ' + JSON.stringify(payload));

  matchesCache[matchId] = payload;
  return payload;
}

// From https://github.com/pubg/api-assets/blob/master/dictionaries/telemetry/mapName.json
const mapNameMapping: Record<string, string> = {
  Baltic_Main: 'Erangel',
  Chimera_Main: 'Paramo',
  Desert_Main: 'Miramar',
  DihorOtok_Main: 'Vikendi',
  Erangel_Main: 'Erangel',
  Heaven_Main: 'Haven',
  Kiki_Main: 'Deston',
  Range_Main: 'Camp Jackal',
  Savage_Main: 'Sanhok',
  Summerland_Main: 'Karakin',
  Tiger_Main: 'Taego',
};

export function getMapName(apiMapName: string) {
  return mapNameMapping[apiMapName] || apiMapName;
}
