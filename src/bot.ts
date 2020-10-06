import { MatrixClient } from 'matrix-bot-sdk';
import marked from 'marked';

/* eslint-disable no-console */
import {
  createMatrixClient,
  sendMessageToJoinedRoomsOrEditExistingMessages,
} from './matrix-bot';
import { Settings } from './settings';
import { getPlayerSummariesFromSteamApi, PlayerSummary } from './steam-api';
import { getSteamFriendsStatusString } from './message-formatter';

async function poll(settings: Required<Settings>, botClient: MatrixClient) {
  try {
    await checkSteamFriendsStatus(settings, botClient);
  } catch (e) {
    console.error('Something went wrong polling steam player summaries', e);
  }
  setPollTimeout(settings, botClient);
}

function setPollTimeout(settings: Required<Settings>, botClient: MatrixClient) {
  setTimeout(() => {
    poll(settings, botClient);
  }, settings.pollFrequency * 1000);
}

async function checkSteamFriendsStatus(
  settings: Required<Settings>,
  botClient: MatrixClient
) {
  let data: PlayerSummary[];
  try {
    data = await getPlayerSummariesFromSteamApi(
      settings.steamWebApiKey,
      settings.steamFriendIdsForStatus
    );
  } catch (e) {
    throw new Error(
      'Get ISteamUser.GetPlayerSummaries API error: ' + JSON.stringify(e)
    );
  }

  console.log('checkSteamFriendsStatus');
  if (!data.length) {
    console.log(
      '  no player summaries returned, has settings.steamFriendIdsForStatus been set with valid ids?'
    );
    return;
  }
  const message = getSteamFriendsStatusString(settings, data);
  console.log(message);
  if (!settings.dryRun) {
    sendMessageToJoinedRoomsOrEditExistingMessages(
      botClient,
      message,
      marked(message)
    );
  }
}

/**
 * Starts the Matrix bot
 */
export async function startBot(userSettings: Settings) {
  const settings: Required<Settings> = {
    storageFile: 'bot-storage.json',
    dryRun: false,
    autoJoin: false,
    ...userSettings,
  };

  // Connect to Matrix
  const botClient = createMatrixClient(settings);
  await botClient.start();

  console.log('SteamBot online');

  poll(settings, botClient);
}
