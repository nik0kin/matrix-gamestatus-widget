import asyncThrottleCache from 'async-throttle-cache';
import { isUserAuthed } from '$lib/auth';
import type { CommonMatchHistory } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import { getGameString, getLast10TFTMatches, getMatchHistoryString } from '$lib/providers/riot/tft';
import {
  getGameString as getPubgGameString,
  getRecentPubgMatches,
  getMatchHistoryString as getPubgMatchHistoryString,
} from '$lib/providers/pubg';
import type { ProcessedLeagueOfLegendsIds, ProcessedPubgIds } from '$lib/settings';
import { wait } from '$lib/utils/async-wait';
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
      const matches = await getTFTMatches(riotApiKey);

      matchHistories = matchHistories.concat(matches);
    }
  } catch (e) {
    return {
      body: {
        error:
          'TFT getLast10TFTMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)),
      },
    };
  }

  // PUBG - Krafton
  try {
    const { pubgApiKey } = settings;
    if (pubgApiKey) {
      const matches = await getPubgMatches(pubgApiKey);

      matchHistories = matchHistories.concat(matches);
    }
  } catch (e) {
    return {
      body: {
        error: 'PUBG getPubgMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)),
      },
    };
  }

  return {
    body: {
      matchHistories: matchHistories.sort((a, b) => b.date - a.date),
    },
  };
};

async function _getTFTMatches(riotApiKey: string) {
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

      // get last 10 matches
      const last10Matches = await getLast10TFTMatches(riotApiKey, puuid, 'americas');

      // convert it to a common match history object
      return last10Matches.map((m) => ({
        userKey: player.key || player.id,
        date: m.info.game_datetime,
        game: getGameString(m),
        status: getMatchHistoryString(puuid, m),
      }));
    });

  const matches: CommonMatchHistory[] = [];
  for (const promise of matchesPromises) {
    matches.push(...(await promise));

    // cant do more than 20 per second (riot api ratelimiting)
    await wait(1 * 1000);
  }

  return matches;
}
const getTFTMatches = asyncThrottleCache(_getTFTMatches, 5 * 60 * 1000);

async function _getPubgMatches(pubgApiKey: string) {
  const pubgPlayers = (settings.pubgPlayersForMatchHistory || '')
    .split(',')
    .map((v): ProcessedPubgIds => {
      const p = v.split('|');
      return {
        platform: p[0],
        idOrPlayerName: p[1],
      };
    });
  const isPlayerId = (x: string) => x.match('account.');
  const pubgPlayersWithNames = pubgPlayers
    .filter((p) => !isPlayerId(p.idOrPlayerName))
    .map((m) => m.idOrPlayerName);
  const pubgPlayersWithIds = pubgPlayers
    .filter((p) => isPlayerId(p.idOrPlayerName))
    .map((m) => m.idOrPlayerName);
  const playerNameMatches = await getRecentPubgMatches(
    pubgApiKey,
    'playerNames',
    pubgPlayersWithNames,
    'steam'
  );
  const playerIdMatches = await getRecentPubgMatches(
    pubgApiKey,
    'playerIds',
    pubgPlayersWithIds,
    'steam'
  );
  return [...playerNameMatches, ...playerIdMatches].map(
    ([pId, pName, m]): CommonMatchHistory => ({
      userKey: pName,
      date: new Date(m.data.attributes.createdAt).getTime(),
      game: getPubgGameString(m),
      status: getPubgMatchHistoryString(pId, m),
    })
  );
}

const getPubgMatches = asyncThrottleCache(_getPubgMatches, 5 * 60 * 1000);
