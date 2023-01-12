export interface Settings {
  //// SETUP ////

  /**
   * Steam webapi key
   *   Generate at https://steamcommunity.com/dev/apikey
   */
  steamWebApiKey: string;
  /**
   * Comma separated list of steam user id's to query for status message
   *   Use https://steamapi.xpaw.me/#ISteamUser/ResolveVanityURL to get an Id from the vanity url
   */
  steamFriendIdsForStatus: string;

  /**
   * Riot api key used for League of Leagues stats
   *   Generate at https://developer.riotgames.com/
   *   Note that id/puuid's used down below are encrypted and tied to the key, so if you use a new key, you'll have to get a new set of id/puuids's
   */
  leagueOfLegendsRiotApiKey?: string;
  /**
   * Comma separated list of regions and summoner id's to query for status message
   * Eg. "leagueOfLegendsSummonerIdsForStatus=na1|summonerId123|BOB,na1|summonerId456|KING"
   *   Use https://<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key> to get summonerId (id)
   */
  leagueOfLegendsSummonerIdsForStatus?: string;
  /**
   * Comma separated list of regions and summoner id's to query for match history
   * Eg. "leagueOfLegendsPuuidsForMatchHistory=americas|puuid123|BOB,americas|puuid456|KING"
   *   Use https://<region>.api.riotgames.com/lol/summoner/v4/summoners/by-name/<name>?api_key=<key> to get puuid
   */
  leagueOfLegendsPuuidsForMatchHistory?: string;

  /**
   * Riot api key used for Teamfight Tactics stats
   *   Generate at https://developer.riotgames.com/
   *   Note that id/puuid's used down below are encrypted and tied to the key, so if you use a new key, you'll have to get a new set of id/puuids's
   */
  teamFightTacticsRiotApiKey?: string;
  /**
   * Comma separated list of regions and summoner id's to query for match history
   * Eg. "teamFightTacticsPuuidsForMatchHistory=americas|puuid123|BOB,americas|puuid456|KING"
   *   Use https://<region>.api.riotgames.com/tft/summoner/v1/summoners/by-name/<name>?api_key=<key> to get puuid
   */
  teamFightTacticsPuuidsForMatchHistory?: string;

  /**
   * Pubg api key
   *   Generate at https://documentation.pubg.com/
   */
  pubgApiKey?: string;
  /**
   * Comma separated list of platforms and (playerIds or playerNames) to query for match history
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
