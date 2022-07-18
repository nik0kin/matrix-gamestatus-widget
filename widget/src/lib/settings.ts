export interface Settings {
  //// SETUP ////

  /**
   * Steam webapi key
   *   Generate at https://steamcommunity.com/dev/apikey
   */
  steamWebApiKey: string;
  /**
   * Comma seperated list of steam user Id's to query for status message
   *   Use https://steamapi.xpaw.me/#ISteamUser/ResolveVanityURL to get an Id from the vanity url
   */
  steamFriendIdsForStatus: string;

  /**
   * Allow users from this homeserver to access the game status page
   *   TODO more options
   */
  allowlistHomeserver?: string;
}
