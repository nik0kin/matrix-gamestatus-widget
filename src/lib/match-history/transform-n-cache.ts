import asyncThrottleCache from 'async-throttle-cache';
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
import type { CommonMatchHistory } from '$lib/common-game-status';
import { getEnvSettings } from '$lib/env-settings';
import type { ProcessedLeagueOfLegendsIds, ProcessedPubgIds } from '$lib/settings';
import { wait } from '$lib/utils/async-wait';

const settings = getEnvSettings();

async function _getLoLMatches() {
  const { leagueOfLegendsRiotApiKey } = settings;
  const players = settings.leagueOfLegendsPuuidsForMatchHistory
    ? settings.leagueOfLegendsPuuidsForMatchHistory.split(',')
    : [];

  if (!leagueOfLegendsRiotApiKey || !players.length) {
    return [];
  }

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
    const lastMatches = await getLastLoLMatches(
      leagueOfLegendsRiotApiKey,
      puuid,
      'americas',
      count
    );

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
export const getLoLMatches = asyncThrottleCache(
  _getLoLMatches,
  5 * 60 * 1000
) as typeof _getLoLMatches;

async function _getTFTMatches() {
  const { teamFightTacticsRiotApiKey } = settings;
  const players = settings.teamFightTacticsPuuidsForMatchHistory
    ? settings.teamFightTacticsPuuidsForMatchHistory.split(',')
    : [];

  if (!teamFightTacticsRiotApiKey || !players.length) {
    return [];
  }

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
    const lastMatches = await getLastTFTMatches(
      teamFightTacticsRiotApiKey,
      puuid,
      'americas',
      count
    );

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
export const getTFTMatches = asyncThrottleCache(
  _getTFTMatches,
  5 * 60 * 1000
) as typeof _getTFTMatches;

async function _getPubgMatches() {
  const { pubgApiKey } = settings;

  const pubgPlayers = (
    settings.pubgPlayersForMatchHistory ? settings.pubgPlayersForMatchHistory.split(',') : []
  ).map((v): ProcessedPubgIds => {
    const p = v.split('|');
    return {
      platform: p[0],
      idOrPlayerName: p[1],
    };
  });

  if (!pubgApiKey || !pubgPlayers.length) {
    return [];
  }

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

export const getPubgMatches = asyncThrottleCache(
  _getPubgMatches,
  5 * 60 * 1000
) as typeof _getPubgMatches;
