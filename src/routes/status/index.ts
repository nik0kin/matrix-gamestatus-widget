import { isUserAuthed } from '$lib/auth';
import type { CommonGameStatus } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import { getSummonerStatus } from '$lib/providers/riot/lol';
import type { ProcessedLeagueOfLegendsIds } from '$lib/settings';
import { getPlayerSummariesFromSteamApi, PersonaState } from './_steam-api';
import type { RequestHandler } from './__types';
import { getSortedList, getStatus } from './_status-helpers';

const settings = getEnvSettings();

export const GET: RequestHandler<{ playerStatus?: CommonGameStatus[] }> = async ({ locals }) => {
  if (!settings.debug && !isUserAuthed(locals.userid)) {
    throw new Error('Unauthed');
  }
  console.log(`${locals.userid} authorized to view status`);

  let playerStatus: CommonGameStatus[] = [];
  const providerErrors: string[] = [];

  // TODO genericize status-getter (like history)

  // Steam
  try {
    const playerSummaries = await getPlayerSummariesFromSteamApi(
      settings.steamWebApiKey,
      settings.steamFriendIdsForStatus.split(',')
    );
    playerStatus = playerStatus.concat(
      getSortedList(playerSummaries).map(
        (p): CommonGameStatus => ({
          userKey: p.personaname,
          status: getStatus(p),
          avatarUrl: p.avatarfull,
          away: p.personastate === PersonaState.AWAY || p.personastate === PersonaState.AWAY_ZZZ,
          offline: p.personastate === PersonaState.OFFLINE,
        })
      )
    );
  } catch (e) {
    const stringifiedError = JSON.stringify(e, Object.getOwnPropertyNames(e));
    const errorMsg =
      'Get ISteamUser.GetPlayerSummaries API error: ' +
      (e instanceof Error ? e.message : stringifiedError);
    providerErrors.push(errorMsg);
    console.error(errorMsg);
    console.error(stringifiedError);
  }

  // LoL, not including TFT - Riot Games
  try {
    const { leagueOfLegendsRiotApiKey } = settings;
    if (leagueOfLegendsRiotApiKey) {
      const summoners = (
        settings.leagueOfLegendsSummonerIdsForStatus
          ? settings.leagueOfLegendsSummonerIdsForStatus.split(',')
          : []
      ).map((v) => {
        const p = v.split('|');
        const s: ProcessedLeagueOfLegendsIds = {
          region: p[0],
          id: p[1],
          key: p[2],
        };
        return s;
      });
      const statusPromises = summoners.map(async (summoner): Promise<CommonGameStatus> => {
        const status = await getSummonerStatus(
          leagueOfLegendsRiotApiKey,
          summoner.id,
          summoner.region
        );
        return {
          userKey: summoner.key || summoner.id,
          status,
          away: false,
          offline: status === 'Unknown',
        };
      });

      playerStatus = playerStatus.concat(await Promise.all(statusPromises));
    }
  } catch (e) {
    const stringifiedError = JSON.stringify(e, Object.getOwnPropertyNames(e));
    const errorMsg =
      'LoL GetCurrentGameInfoBySummoner API error: ' +
      (e instanceof Error ? e.message : stringifiedError);
    providerErrors.push(errorMsg);
    console.error(errorMsg);
    console.error(stringifiedError);
  }

  return {
    body: {
      playerStatus,
      providerErrors,
    },
  };
};
