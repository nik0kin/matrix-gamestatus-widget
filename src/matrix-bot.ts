import { differenceWith, intersectionWith, isEqual } from 'lodash';
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

export async function sendMessageToRooms(
  client: MatrixClient,
  roomIds: string[],
  message: string,
  htmlFormattedMessage?: string
): Promise<Array<[string, string]>> {
  const promises = roomIds.map(async (roomId) => {
    const eventId = await client.sendMessage(roomId, {
      msgtype: 'm.notice',
      body: message,
      ...(htmlFormattedMessage
        ? {
            format: 'org.matrix.custom.html',
            formatted_body: htmlFormattedMessage,
          }
        : {}),
    });
    return [roomId, eventId] as const;
  });

  return (await Promise.all(promises)) as Array<[string, string]>;
}

// Based on https://github.com/matrix-org/matrix-react-sdk/pull/2952/files#diff-e3ff98cfed77f0601d9500761d04d7b9R108-R123
export async function editExistingMessages(
  client: MatrixClient,
  messageRoomAndEventIds: string[][],
  message: string,
  htmlFormattedMessage?: string
): Promise<Array<[string, string]>> {
  const promises = messageRoomAndEventIds.map(
    async ([roomId, originalMessageEventId]) => {
      const newContent: any = {
        msgtype: 'm.notice',
        body: message,
      };
      if (htmlFormattedMessage) {
        newContent.format = 'org.matrix.custom.html';
        newContent.formatted_body = htmlFormattedMessage;
      }
      const content = Object.assign(
        {
          'm.new_content': newContent,
          'm.relates_to': {
            rel_type: 'm.replace',
            event_id: originalMessageEventId,
          },
        },
        newContent
      );

      const eventId = await client.sendMessage(roomId, content);
      return [roomId, eventId] as const;
    }
  );

  return (await Promise.all(promises)) as Array<[string, string]>;
}

const MESSAGES_KEY = 'sentMessageAndRoomIds';

const comparator = (value: string | string[], other: string | string[]) => {
  if (value.length === 0 && other.length === 0) {
    return true;
  }

  const a1 = typeof value === 'object' ? value[0] : value;
  const a2 = typeof other === 'object' ? other[0] : other;
  return isEqual(a1, a2);
};

export async function sendMessageToJoinedRoomsOrEditExistingMessages(
  client: MatrixClient,
  message: string,
  htmlFormattedMessage?: string
) {
  let existingMessagesRoomAndEventIds: string[][] = [];
  const result = (client.storageProvider as SimpleFsStorageProvider).readValue(
    MESSAGES_KEY
  );
  if (typeof result === 'string') {
    existingMessagesRoomAndEventIds = JSON.parse(result);
  }

  const joinedRoomIds = await client.getJoinedRooms();

  if (!joinedRoomIds.length) {
    client.storageProvider.storeValue(MESSAGES_KEY, JSON.stringify([]));
  }

  const existingMessagesInJoinedRooms = intersectionWith(
    existingMessagesRoomAndEventIds,
    joinedRoomIds,
    comparator
  );
  const newMessageRooms = differenceWith(
    joinedRoomIds,
    existingMessagesInJoinedRooms,
    comparator
  );

  let existingMessageAndRoomIds: Array<[string, string]> = [];
  let newMessageAndRoomIds: Array<[string, string]> = [];

  if (existingMessagesInJoinedRooms.length) {
    existingMessageAndRoomIds = await editExistingMessages(
      client,
      existingMessagesInJoinedRooms,
      message,
      htmlFormattedMessage
    );
  }

  if (newMessageRooms.length) {
    newMessageAndRoomIds = await sendMessageToRooms(
      client,
      newMessageRooms,
      message,
      htmlFormattedMessage
    );
  }

  client.storageProvider.storeValue(
    MESSAGES_KEY,
    JSON.stringify([...newMessageAndRoomIds, ...existingMessageAndRoomIds])
  );
}
