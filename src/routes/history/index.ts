import { isUserAuthed } from '$lib/auth';
import { getEnvSettings } from '$lib/env-settings';
import { getMatchHistoriesResponse } from '$lib/match-history';
import type { GetMatchHistoriesResponse } from './_response-types';
import type { RequestHandler } from './__types';

const settings = getEnvSettings();

export const GET: RequestHandler<GetMatchHistoriesResponse> = async ({ locals }) => {
  if (!settings.debug && !isUserAuthed(locals.userid)) {
    throw new Error('Unauthed');
  }
  console.log(`${locals.userid} authorized to view history`);

  console.log('Start fetching matches ', Date.now());

  const [matchHistories, apisUsed, providerErrors] = await getMatchHistoriesResponse();

  console.log('End fetching matches ', Date.now());

  return {
    body: {
      matchHistories: matchHistories.sort((a, b) => b.date - a.date),
      apisUsed,
      providerErrors,
    },
  };
};
