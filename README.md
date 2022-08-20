# matrix-gamestatus-widget

Keep an eye on your Steam friends from Matrix. View your friend's PUBG, TeamFight Tactics match histories.

Widget pages require matrix authentication (seemlessly thru the widget-api, if the matrix client supports it), so your gaming status/recent-histories aren't public to the world\*

> - Use `allowlistHomeserver` setting to restrict access. Restrict access by room is on roadmap

## Example

Imagine steam friendlist but on a simple html page embedded in matrix room widget.

Imagine another page with match histories from all the games your friends play.

## Develop

```
yarn install
yarn dev --open
```

## Run

### Bootstrap mode

Use node 16+

```
# clone repo
yarn install

yarn build

# create & configure .env

yarn global add pm2
pm2 start pm2.config.js
```

## Config

TODO

Configured via .env file

See ./src/lib/settings.ts
