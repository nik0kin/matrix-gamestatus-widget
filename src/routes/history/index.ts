import asyncThrottleCache from 'async-throttle-cache';
import { isUserAuthed } from '$lib/auth';
import type { CommonMatchHistory } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import {
  getGameString as getLoLGameString,
  getLastLoLMatches,
  getMatchHistoryString as getLoLMatchHistoryString,
} from '$lib/providers/riot/lol';
import { getGameString, getLastTFTMatches, getMatchHistoryString } from '$lib/providers/riot/tft';
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
}> = async ({ locals }) => {
  if (!settings.debug && !isUserAuthed(locals.userid)) {
    throw new Error('Unauthed');
  }
  console.log(`${locals.userid} authorized to view history`);

  let matchHistories: CommonMatchHistory[] = [];
  const apisUsed: string[] = [];

  console.log('Start fetching matches ', Date.now());

  const { riotApiKey, pubgApiKey } = settings;

  // Lol - Riot Games
  try {
    if (riotApiKey) {
      const matches = await getLoLMatches(riotApiKey);

      if (matches.length) {
        matchHistories = matchHistories.concat(matches);
        apisUsed.push('riotgames');
      }
    }
  } catch (e) {
    console.error(
      'LoL getLastLoLMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e))
    );

    throw new Error(
      'LoL getLastLoLMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e))
    );
  }

  // TFT - Riot Games
  try {
    if (riotApiKey) {
      const matches = await getTFTMatches(riotApiKey);

      if (matches.length) {
        matchHistories = matchHistories.concat(matches);
        apisUsed.push('riotgames');
      }
    }
  } catch (e) {
    throw new Error(
      'TFT getLastTFTMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e))
    );
  }

  // PUBG - Krafton
  try {
    if (pubgApiKey) {
      const matches = await getPubgMatches(pubgApiKey);

      if (matches.length) {
        matchHistories = matchHistories.concat(matches);
        apisUsed.push('pubg');
      }
    }
  } catch (e) {
    throw new Error(
      'PUBG getPubgMatches() error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e))
    );
  }

  console.log('End fetching matches ', Date.now());

  return {
    body: {
      matchHistories: matchHistories.sort((a, b) => b.date - a.date),
      apisUsed,
    },
  };
};

async function _getLoLMatches(riotApiKey: string) {
  const players = settings.leagueOfLegendsPuuidsForMatchHistory
    ? settings.leagueOfLegendsPuuidsForMatchHistory.split(',')
    : [];
  const matchesPromises = players.map(async (v) => {
    const p = v.split('|');
    const player: ProcessedLeagueOfLegendsIds = {
      region: p[0],
      id: p[1],
      key: p[2],
    };
    const puuid = player.id;

    // get last x matches
    const count = (20 - players.length) / players.length; // allow 1 api call to look up matches, then rest go to lookup matches
    const lastMatches = await getLastLoLMatches(riotApiKey, puuid, 'americas', count);

    // convert it to a common match history object
    return lastMatches.map(
      (m): CommonMatchHistory => ({
        userKey: player.key || player.id,
        date: m.info.gameCreation,
        length: m.info.gameDuration * 1000,
        game: getLoLGameString(m),
        status: getLoLMatchHistoryString(puuid, m),
      })
    );
  });

  const matches: CommonMatchHistory[] = [];
  for (const promise of matchesPromises) {
    matches.push(...(await promise));

    // buffer a little bit
    await wait(100);
  }

  return matches;
}
const getLoLMatches = asyncThrottleCache(_getLoLMatches, 5 * 60 * 1000) as typeof _getLoLMatches;

async function _getTFTMatches(riotApiKey: string) {
  const players = settings.teamFightTacticsPuuidsForMatchHistory
    ? settings.teamFightTacticsPuuidsForMatchHistory.split(',')
    : [];
  const matchesPromises = players.map(async (v) => {
    const p = v.split('|');
    const player: ProcessedLeagueOfLegendsIds = {
      region: p[0],
      id: p[1],
      key: p[2],
    };
    const puuid = player.id;

    // get last x matches
    const count = (20 - players.length) / players.length; // allow 1 api call to look up matches, then rest go to lookup matches
    const lastMatches = await getLastTFTMatches(riotApiKey, puuid, 'americas', count);

    // convert it to a common match history object
    return lastMatches.map(
      (m): CommonMatchHistory => ({
        userKey: player.key || player.id,
        date: m.info.game_datetime,
        length: m.info.game_length * 1000,
        game: getGameString(m),
        status: getMatchHistoryString(puuid, m),
      })
    );
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
  const pubgPlayers = (
    settings.pubgPlayersForMatchHistory ? settings.pubgPlayersForMatchHistory.split(',') : []
  ).map((v): ProcessedPubgIds => {
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
      length: m.data.attributes.duration * 1000,
      game: getPubgGameString(m),
      status: getPubgMatchHistoryString(pId, m),
    })
  );
}

const getPubgMatches = asyncThrottleCache(_getPubgMatches, 5 * 60 * 1000);
