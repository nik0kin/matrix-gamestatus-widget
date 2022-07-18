import { Settings } from '$lib/settings';

// auth to this widget application backend, not matrix

const authCache = {};

export function authUser({ allowlistHomeserver }: Settings, userId: string, mxId: string) {
  if (allowlistHomeserver && !mxId.match(new RegExp(`:${allowlistHomeserver}$`))) {
    // Silenting don't auth, maybe we should show an error screen?
    console.log(
      `Matrix User ${mxId} not allowed by allowlistHomeserver=${allowlistHomeserver}`,
      regexp
    );
    return;
  }

  authCache[userId] = mxId;
}

export function isUserAuthed(userId) {
  return !!authCache[userId];
}
