import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
} from 'matrix-bot-sdk';
import { Settings } from './settings';

export function createMatrixClient(settings: Required<Settings>) {
  const storage = new SimpleFsStorageProvider(settings.storageFile);
  const client = new MatrixClient(
    settings.homeserverUrl,
    settings.matrixAccessToken,
    storage
  );
  if (settings.autoJoin) {
    AutojoinRoomsMixin.setupOnClient(client);
  }
  return client;
}

export function sendMessageToAllJoinedRooms(
  client: MatrixClient,
  message: string,
  htmlFormattedMessage?: string
) {
  client.getJoinedRooms().then((rooms) => {
    rooms.forEach((roomId) => {
      client.sendMessage(roomId, {
        msgtype: 'm.notice',
        body: message,
        ...(htmlFormattedMessage
          ? {
              format: 'org.matrix.custom.html',
              formatted_body: htmlFormattedMessage,
            }
          : {}),
      });
    });
  });
}
