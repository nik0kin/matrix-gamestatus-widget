import { Settings } from './settings';

import * as dotenv from 'dotenv';
dotenv.config();

const { steamWebApiKey, steamFriendIdsForStatus, allowlistHomeserver } = process.env;
const settings = { steamWebApiKey, steamFriendIdsForStatus, allowlistHomeserver };

console.log('EnvSettings: ', settings);

export const getEnvSettings = (): Settings => settings;
