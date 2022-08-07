import { isUserAuthed } from '$lib/auth';
import type { CommonGameStatus } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import { getSummonerStatus } from '$lib/providers/riot/lol';
import type { ProcessedLeagueOfLegendsSummonerIds } from '$lib/settings';
import { getPlayerSummariesFromSteamApi, PersonaState } from './_steam-api';
import type { RequestHandler } from './__types';
import { getSortedList, getStatus } from './_status-helpers';

const settings = getEnvSettings();

export const GET: RequestHandler<{ playerStatus?: CommonGameStatus[]; error?: string }> = async ({
  locals,
}) => {
  if (!settings.debug && !isUserAuthed(locals.userid)) {
    return {
      body: {
        error: 'Unauthed',
      },
    };
  }
  console.log(`${locals.userid} authorized to view status`);

  let playerStatus: CommonGameStatus[] = [];

  // Steam
  try {
    const playerSummaries = await getPlayerSummariesFromSteamApi(
      settings.steamWebApiKey,
      settings.steamFriendIdsForStatus.split(',')
    );
    playerStatus = playerStatus.concat(
      getSortedList(playerSummaries).map((p) => ({
        userKey: p.personaname,
        status: getStatus(p),
        away: p.personastate === PersonaState.AWAY || p.personastate === PersonaState.AWAY_ZZZ,
        offline: p.personastate === PersonaState.OFFLINE,
      }))
    );
  } catch (e) {
    return {
      body: {
        error: 'Get ISteamUser.GetPlayerSummaries API error: ' + JSON.stringify(e),
      },
    };
  }

  // Riot
  try {
    const { riotApiKey } = settings;
    if (riotApiKey) {
      const summoners = (settings.leagueOfLegendsSummonerIdsForStatus || '').split(',').map((v) => {
        const p = v.split('|');
        const s: ProcessedLeagueOfLegendsSummonerIds = {
          region: p[0],
          summonerId: p[1],
          key: p[2],
        };
        return s;
      });
      const promises = summoners.map(async (summoner) => {
        const status = await getSummonerStatus(riotApiKey, summoner.region, summoner.summonerId);
        return {
          userKey: summoner.key || summoner.summonerId,
          status,
          away: false,
          offline: status === 'Offline' || status === 'Unknown',
        };
      });

      playerStatus = playerStatus.concat(await Promise.all(promises));
    }
  } catch (e) {
    return {
      body: {
        error: 'LoL GetCurrentGameInfoBySummoner API error: ' + JSON.stringify(e),
      },
    };
  }

  return {
    body: {
      playerStatus,
    },
  };
};
