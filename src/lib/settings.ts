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
   * Riot api key
   *   Generate at https://developer.riotgames.com/
   */
  riotApiKey?: string;
  /**
   * Comma seperated list of regions and summoner Id's to query for status message
   * Eg. "leagueOfLegendsSummonerIdsForStatus=na1|summonerId123|BOB,na1|summonerId456|KING"
   *   Use https://<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key> to get summonerId (id)
   */
  leagueOfLegendsSummonerIdsForStatus?: string;
  /**
   * Comma seperated list of regions and summoner Id's to query for match history
   * Eg. "leagueOfLegendsPuuidsForMatchHistory=americas|puuid123|BOB,americas|puuid456|KING"
   *   Use https://<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key> to get puuid
   */
  leagueOfLegendsPuuidsForMatchHistory?: string;
  /**
   * Comma seperated list of regions and summoner Id's to query for match history
   * Eg. "teamFightTacticsPuuidsForMatchHistory=americas|puuid123|BOB,americas|puuid456|KING"
   *   Use https://<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key> to get puuid
   */
  teamFightTacticsPuuidsForMatchHistory?: string;

  /**
   * Pubg api key
   *   Generate at https://documentation.pubg.com/
   */
  pubgApiKey?: string;
  /**
   * Comma seperated list of platforms and (playerIds or playerNames) to query for match history
   * Eg. "pubgIdsForMatchHistory=steam|MyFriendsUsername,steam|account.zxydatabaseidcba"
   *   Use https://documentation.pubg.com/en/players-endpoint.html#/Players/get_players w/ filter[playerNames] to find account id
   */
  pubgPlayersForMatchHistory?: string;

  /**
   * Allow users from this homeserver to access the game status page
   *  Example: matrix.org
   *   TODO more similar options
   */
  allowlistHomeserver?: string;

  //// OPERATIONS ////

  /**
   * Disables matrix auth and allows access to anyone
   */
  debug?: boolean;
}

export interface ProcessedLeagueOfLegendsIds {
  region: string;
  id: string;
  key?: string;
}

export interface ProcessedPubgIds {
  platform: string;
  idOrPlayerName: string;
}
