const authCache = {};

export function authUser(userId: string, mxId: string) {
  authCache[userId] = mxId;
}

export function isUserAuthed(userId) {
  return !!authCache[userId];
}
