import { authUser, isUserAuthed } from '$lib/auth';
import { getEnvSettings } from '$lib/env-settings';
import type { PostAuthRequest } from './_auth-request-types';
import { authWithMatrix } from './_matrix-auth';
import type { RequestHandler } from './__types';

export const GET: RequestHandler = async () => {
  return {
    body: {},
  };
};

// Auth
export const POST: RequestHandler = async ({ locals, request }) => {
  if (isUserAuthed(locals.userid)) {
    return {};
  }

  const body: PostAuthRequest = await request.json();
  const mxId = await authWithMatrix(false, body.accessToken, body.matrixServerName);
  authUser(getEnvSettings(), locals.userid, mxId);
  return {};
};
