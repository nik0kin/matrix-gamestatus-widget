// import fetch from 'node-fetch';

export enum PersonaState {
  OFFLINE = 0,
  ONLINE = 1,
  AWAY = 3,
  AWAY_ZZZ = 4, // ??? set away status or away a long time?
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
  gameid?: string;
}

export interface PlayerSummariesResponse {
  response: {
    players: PlayerSummary[];
  };
}

const baseUrl = 'https://api.steampowered.com';

export async function getPlayerSummariesFromSteamApi(webapiKey: string, steamIds: string[]) {
  const url = `${baseUrl}/ISteamUser/GetPlayerSummaries/v2/?key=${webapiKey}&steamids=${steamIds.join(
    ','
  )}`;
  const response = await fetch(url);
  const data = (await response.json()) as PlayerSummariesResponse;

  if (!data.response) {
    throw new Error('Bad getPlayerSummariesFromSteamApi() response: ' + JSON.stringify(data));
  }

  return data.response.players;
}
