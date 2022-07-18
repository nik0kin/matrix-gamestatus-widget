# matrix-gamestatus-bot

Keep an eye on your Steam friends from Matrix.

## Example

Imagine steam friendlist but on a simple html page embedded in matrix room widget.

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
