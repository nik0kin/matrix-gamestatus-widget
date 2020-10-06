import fetch from 'node-fetch';

export enum PersonaState {
  ONLINE = 1,
  OFFLINE = 2,
  AWAY = 3,
}

export interface PlayerSummary {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: PersonaState;
  realname: string;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;

  gameextrainfo?: string;
  gameid?: number;
}

export interface PlayerSummariesResponse {
  response: {
    players: PlayerSummary[];
  };
}

const baseUrl = 'https://api.steampowered.com';

export async function getPlayerSummariesFromSteamApi(
  webapiKey: string,
  steamIds: string[]
) {
  const url = `${baseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${webapiKey}&steamids=${steamIds.join(
    ','
  )}`;
  const response = await fetch(url);
  return ((await response.json()) as PlayerSummariesResponse).response.players;
}
