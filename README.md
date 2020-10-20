# Overview

Hey there!

Here's my CSS frontend coding submission. I hope it's a good jumping off point for some future discussions. Enjoy!

# To run

Experience the app in production mode, by building it and serving it locally:

`yarn && yarn build && yarn serve`.

Then navigate to http://localhost:5000

**Remember:** the web app expects you to be running a local websocket feed at `localhost:4000`. The app will contintiously retry for a websocket connection. If you're running the websocket on another endpoint, use the env var below. The websocket server is *not* included in this repo.

## Env vars

`WEBSOCKET_ENDPOINT` - Defaults to `http://localhost:4000` if not defined

e.g. `WEBSOCKET_ENDPOINT=http://localhost:8000 yarn build`

## Commands

`yarn start` - Dev mode

`yarn build` - Production build

`yarn serve` - Tiny HTTP serve to serve the production `build` folder after you build

#### Notes

- If the app crashes (it shouldn't), turn off concurrent mode in `index.tsx`.