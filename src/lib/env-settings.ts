import type { Settings } from './settings';

import * as dotenv from 'dotenv';
dotenv.config();

const { steamWebApiKey, steamFriendIdsForStatus, allowlistHomeserver, debug } = process.env;
const settings = {
  steamWebApiKey,
  steamFriendIdsForStatus,
  allowlistHomeserver,
  debug: debug === 'true',
} as Settings;

console.log('EnvSettings: ', settings);

export const getEnvSettings = (): Settings => settings;
