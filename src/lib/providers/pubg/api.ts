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

const gameModeMapping: Record<string, string> = {
  duo: 'Duo TPP',
  'duo-fpp': 'Duo FPP',
  solo: 'Solo TPP',
  'solo-fpp': 'Solo FPP',
  squad: 'Squad TPP',
  'squad-fpp': 'Squad FPP',
  'conquest-duo': 'Conquest Duo TPP',
  'conquest-duo-fpp': 'Conquest Duo FPP',
  'conquest-solo': 'Conquest Solo TPP',
  'conquest-solo-fpp': 'Conquest Solo FPP',
  'conquest-squad': 'Conquest Squad TPP',
  'conquest-squad-fpp': 'Conquest Squad FPP',
  'esports-duo': 'Esports Duo TPP',
  'esports-duo-fpp': 'Esports Duo FPP',
  'esports-solo': 'Esports Solo TPP',
  'esports-solo-fpp': 'Esports Solo FPP',
  'esports-squad': 'Esports Squad TPP',
  'esports-squad-fpp': 'Esports Squad FPP',
  'normal-duo': 'Duo TPP',
  'normal-duo-fpp': 'Duo FPP',
  'normal-solo': 'Solo TPP',
  'normal-solo-fpp': 'Solo FPP',
  'normal-squad': 'Squad TPP',
  'normal-squad-fpp': 'Squad FPP',
  'war-duo': 'War Duo TPP',
  'war-duo-fpp': 'War Duo FPP',
  'war-solo': 'War Solo TPP',
  'war-solo-fpp': 'War Solo FPP',
  'war-squad': 'Squad TPP',
  'war-squad-fpp': 'War Squad FPP',
  'zombie-duo': 'Zombie Duo TPP',
  'zombie-duo-fpp': 'Zombie Duo FPP',
  'zombie-solo': 'Zombie Solo TPP',
  'zombie-solo-fpp': 'Zombie Solo FPP',
  'zombie-squad': 'Zombie Squad TPP',
  'zombie-squad-fpp': 'Zombie Squad FPP',
  'lab-tpp': 'Lab TPP',
  'lab-fpp': 'Lab FPP',
  tdm: 'Team Deathmatch',
};

export function getGameMode(apiGameMode: string) {
  return gameModeMapping[apiGameMode] || apiGameMode;
}
