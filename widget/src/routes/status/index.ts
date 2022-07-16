import * as dotenv from 'dotenv';
dotenv.config();

import { getPlayerSummariesFromSteamApi } from './_steam-api';
import type { RequestHandler } from './__types';

const config = process.env;

/** @type {import('./__types').RequestHandler} */
export const GET: RequestHandler = async ({ locals }) => {
  // locals.userid comes from src/hooks.js

  let playerSummaries: PlayerSummary[];
  try {
    playerSummaries = await getPlayerSummariesFromSteamApi(
      config.steamWebApiKey,
      config.steamFriendIdsForStatus.split(',')
    );
  } catch (e) {
    return {
      body: {
        error: new Error('Get ISteamUser.GetPlayerSummaries API error: ' + JSON.stringify(e)),
      },
    };
  }

  // console.log('checkSteamFriendsStatus');
  // if (!data.length) {
  // 	console.log(
  // 		'  no player summaries returned, has settings.steamFriendIdsForStatus been set with valid ids?'
  // 	);
  // 	return;
  // }

  return {
    body: {
      playerSummaries,
    },
  };
};
