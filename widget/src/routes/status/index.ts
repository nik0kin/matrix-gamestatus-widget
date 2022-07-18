import { isUserAuthed } from '$lib/auth';
import { getEnvSettings } from '$lib/env-settings';
import { getPlayerSummariesFromSteamApi } from './_steam-api';
import type { RequestHandler } from './__types';

const settings = getEnvSettings();

/** @type {import('./__types').RequestHandler} */
export const GET: RequestHandler = async ({ locals }) => {
  if (!isUserAuthed(locals.userid)) {
    return {
      body: {
        error: 'Unauthed',
      },
    };
  }
  console.log(`${locals.userid} authorized to view status`);

  let playerSummaries: PlayerSummary[];
  try {
    playerSummaries = await getPlayerSummariesFromSteamApi(
      settings.steamWebApiKey,
      settings.steamFriendIdsForStatus.split(',')
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
