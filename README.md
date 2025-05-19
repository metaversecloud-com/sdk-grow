# README Template

Please update the following in each of your SDK application.

## Introduction / Summary

This boilerplate is meant to give you a simple starting point to build new features in Topia using our Javascript SDK. Please reference the [documentation](https://metaversecloud-com.github.io/mc-sdk-js/index.html) for a more detailed breakdown of what the SDK is capable of and how to use it!

## Key Features

This repository contains an SDK app that allows you to check in as a non-admin/admin user once a day in order to "pump up" a balloon until a certain amount of goal pumps is reached.

### Canvas elements & interactions

- Key Asset: When clicked this asset will open the drawer and allow users and admins to start interacting with the app.
- Currently need to switch key asset to the actual balloon.

### Drawer content

- How to play instructions: As a non-admin/user, open the drawer in the iframe by clicking on the key asset. Press the check in button (only allowed once daily) to increase
  the number of pumps of the balloon by 1. The balloon will keep growing larger at certain milestones (20 pngs/ 20 stages) until it eventually pops. At that point, you are no longer allowed to check in.
- Admin features (see below)

### Admin features

_Does your app have special admin functionality? If so your key features may looks something like this:_

- Access: Click on the key asset to open the drawer and then select the Admin gear icon.
- Set the goal: fill out the number input and click the button to confirm to change the goal to the entered input to pop the balloon.
- Reset: Click on the Reset button to reset the current tally and get rid of all daily check-in information.

### Themes description

- Not sure what to put here

### Data objects

_We use data objects to store information about each implementation of the app per world._

- Key Asset: the data object attached to the dropped key asset will store information related to this specific implementation of the app and would be deleted if the key asset is removed from world. Example data:
  - isResetInProgress
  - lastInteraction
  - lastPlayerTurn
  - playerCount
  - resetCount
  - turnCount
- World: the data object attached to the world will store analytics information for every instance of the app in a given world by keyAssetId and will persist even if a specific instance is removed from world. Example data:

  - gamesPlayedByUser (`keyAssets.${assetId}.gamesPlayedByUser.${profileId}.count`)
  - gamesWonByUser (`keyAssets.${keyAssetId}.gamesWonByUser.${profileId}.count`)
  - totalGamesResetCount (`keyAssets.${assetId}.totalGamesResetCount`)
  - totalGamesWonCount (`keyAssets.${assetId}.totalGamesWonCount`)

  droppedAsset:
  Made CheckInDataObject interface:

  - dailyCheckIns: records the total number of check ins on that day as well as a list of users who checked in that day (maps the date to users and total for that day)
  - goal: the goal number of check ins
  - overallTally: the total number of check ins during that session, regardless of days. Once the admin resets the tally, this goes back to 0.
  - shouldReset: should the tally be reset? (not really utilized in application)

## Developers:

Caleb Hollander

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### Getting Started

- Clone this repository
- Run `npm i` in server
- `cd client`
- Run `npm i` in client
- `cd ..` back to server

### Add your .env environmental variables

```json
API_KEY=NTJhZDJlNTQtMzNmMy00M2JmLTg2YTgtODlhYjM3YmVjNTcw
INSTANCE_DOMAIN=api.topia.io
INSTANCE_PROTOCOL=https
INTERACTIVE_KEY=3XFv3b60uIm2nkxTw1LL
INTERACTIVE_SECRET=NzU3MGQ2YmQtMGNiZS00MmVkLTkxN2ItMDdlYTBkMTUzZDQ0
```

### Where to find API_KEY, INTERACTIVE_KEY and INTERACTIVE_SECRET

[Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)

[Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- [View it in action!](topia.io/appname-prod)
- To see an example of an on canvas turn based game check out TicTacToe:
  - (github))[https://github.com/metaversecloud-com/sdk-tictactoe]
  - (demo))[https://topia.io/tictactoe-prod]
