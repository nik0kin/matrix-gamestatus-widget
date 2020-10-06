export interface Settings {
  //// SETUP ////

  /**
   * Matrix Homeserver
   *  Eg. "https://matrix-federation.matrix.org"
   */
  homeserverUrl: string;
  /**
   * Access Token of the bot account
   *   See https://t2bot.io/docs/access_tokens/ for a simple way to generate
   */
  matrixAccessToken: string;
  /**
   * Steam webapi key
   *   Generate at https://steamcommunity.com/dev/apikey
   */
  steamWebApiKey: string;
  /**
   * List of steam user Id's to query for status message
   *   Use https://steamapi.xpaw.me/#ISteamUser/ResolveVanityURL to get an Id from the vanity url
   */
  steamFriendIdsForStatus: string[];
  /**
   * File used as temporary storage by the bot
   *   Defaults to `bot-storage.json`
   */
  storageFile?: string;

  //// OPERATIONS ////

  /**
   * Dry run indicates that no messages will be sent to Matrix
   *   Defaults to `false`
   */
  dryRun?: boolean;
  /**
   * Frequency of the bot polling Strava's API (in seconds)
   */
  pollFrequency: number;
  /**
   * Should the bot auto accept invites to rooms?
   *    (Probably not if you want your steam status' private)
   *   Defaults to `false`
   */
  autoJoin?: boolean;
}
