import { isUserAuthed } from '$lib/auth';
import type { CommonMatchHistory } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import { getLast10TFTMatches, getMatchHistoryString } from '$lib/providers/riot/tft';
import type { ProcessedLeagueOfLegendsIds } from '$lib/settings';
import type { RequestHandler } from './__types';

const settings = getEnvSettings();

export const GET: RequestHandler<{
  matchHistories?: CommonMatchHistory[];
  error?: string;
}> = async ({ locals }) => {
  if (!settings.debug && !isUserAuthed(locals.userid)) {
    return {
      body: {
        error: 'Unauthed',
      },
    };
  }
  console.log(`${locals.userid} authorized to view history`);

  let matchHistories: CommonMatchHistory[] = [];

  // TFT - Riot Games
  try {
    const { riotApiKey } = settings;
    if (riotApiKey) {
      const matchesPromises = (settings.teamFightTacticsPuuidsForMatchHistory || '')
        .split(',')
        // Per player
        .map(async (v) => {
          const p = v.split('|');
          const player: ProcessedLeagueOfLegendsIds = {
            region: p[0],
            id: p[1],
            key: p[2],
          };
          const puuid = player.id;

          // get last 10 matches, and convert it to a common match history object
          return (await getLast10TFTMatches(riotApiKey, puuid, 'americas')).map((m) => ({
            userKey: 'Niko-TFT',
            date: m.info.game_datetime,
            status: getMatchHistoryString(puuid, m),
          }));
        });

      // TODO could a flatmap somewhere make this cleaner?
      matchHistories = matchHistories.concat((await Promise.all(matchesPromises)).flat());
    }
  } catch (e) {
    return {
      body: {
        error:
          'TFT getLast10TFTMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)),
      },
    };
  }

  return {
    body: {
      matchHistories,
    },
  };
};
