# matrix-steam-bot
# matrix-steamstatus-bot
# matrix-steamfriendstatus-bot

Keep an eye on your Steam friends from Matrix.

## Example

```
Bot: Steam Status:
 - Joy - Solitaire
 - Bobby - Offline
```

## Develop

```
yarn install
yarn dev
```

## Run

### Bootstrap mode

```
# clone repo
yarn install

cp bot-config.sample.json bot-config.json
# configure bot-config.json

yarn global add pm2
pm2 start pm2.config.js
```

### As a Node.js package

```
yarn add matrix-steam-bot
```

```
import { startBot } from 'matrix-steam-bot';

const config = {
  // see bot-config.sample.json
};

startBot(config);
```

## Config

See [settings.ts](./src/settings.ts) for config descriptions

