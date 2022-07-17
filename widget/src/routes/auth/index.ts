import type { RequestHandler } from './__types';
import { authUser, isUserAuthed } from '$lib/auth-cache';
import { authWithMatrix } from './_matrix-auth';

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

  const body = await request.json();
  const mxId = await authWithMatrix(false, body.accessToken, body.matrixServerName);
  authUser(locals.userid, mxId);
  return {};
};
