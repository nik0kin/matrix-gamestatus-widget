import { PlayerSummariesResponse } from './steam-api';

export const examplePlayerSummariesResponse: PlayerSummariesResponse = {
  response: {
    players: [
      {
        steamid: '11111',
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: 'Niko',
        profileurl: 'https://steamcommunity.com/id/niko/',
        avatar:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b1/111111.jpg',
        avatarmedium:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b1/111111.jpg',
        avatarfull:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/b1/111111.jpg',
        avatarhash: '111111',
        lastlogoff: 1601871290,
        personastate: 1,
        realname: 'Niko',
        primaryclanid: '1',
        timecreated: 1111111111,
        personastateflags: 0,
        gameextrainfo: 'Fall Guys',
        gameid: '1097150',
      },
      {
        steamid: '22222',
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: 'Tomm',
        profileurl: 'https://steamcommunity.com/id/tomm/',
        avatar:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/18/222222.jpg',
        avatarmedium:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/18/222222.jpg',
        avatarfull:
          'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/18/222222.jpg',
        avatarhash: '222222',
        lastlogoff: 1601922832,
        personastate: 1,
        realname: 'Tomm',
        primaryclanid: '1',
        timecreated: 1111111111,
        personastateflags: 0,
        loccountrycode: 'US',
        locstatecode: 'AZ',
        loccityid: 1111,
      },
    ],
  },
};
