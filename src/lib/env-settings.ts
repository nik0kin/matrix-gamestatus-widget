import type { Settings } from './settings';

import * as dotenv from 'dotenv';
dotenv.config();

const {
  steamWebApiKey,
  steamFriendIdsForStatus,
  riotApiKey,
  leagueOfLegendsSummonerIdsForStatus,
  leagueOfLegendsPuuidsForMatchHistory,
  teamFightTacticsPuuidsForMatchHistory,
  pubgApiKey,
  pubgPlayersForMatchHistory,
  allowlistHomeserver,
  debug,
} = process.env;
const settings = {
  steamWebApiKey,
  steamFriendIdsForStatus,
  riotApiKey,
  leagueOfLegendsSummonerIdsForStatus,
  leagueOfLegendsPuuidsForMatchHistory,
  teamFightTacticsPuuidsForMatchHistory,
  pubgApiKey,
  pubgPlayersForMatchHistory,
  allowlistHomeserver,
  debug: debug === 'true',
} as Settings;

// TODO sanity check settings

console.log('EnvSettings: ', settings);

export const getEnvSettings = (): Settings => settings;
