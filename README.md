<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Grow (Balloon Pump)

## Introduction / Summary

Grow is a shared, community-driven daily check-in app for a Topia world. A dropped asset is placed in the world and, each day, any visitor can click it and press **Help Me Grow!** to "pump" the balloon once. Every check-in bumps a single `overallTally` on that dropped asset; as the tally climbs toward a configurable `goal`, the asset's rendered image advances through **20 visual stages** (`Pump-0.png` → `Pump-19.png`) until the balloon "pops" at the goal. It is action-based (one click per profile per day), not time-based — the balloon does not grow on its own — and state is shared by everyone in the world, not per-visitor. Admins can retune the goal or reset the balloon at any time from a gear icon in the drawer.

## Key Features

- **Daily check-in per profile.** A user's `profileId` may only be recorded once per `YYYY-MM-DD` bucket in `dailyCheckIns`. A second click that day fires a "Already Checked In" toast instead of incrementing.
- **20-stage balloon image.** `getStage(tally, goal)` returns `min(19, floor((tally / goal) * 20))`; the corresponding `Pump-{n}.png` is written to the dropped asset via `droppedAsset.updateWebImageLayers("", newImageSrc)` so everyone in the world sees the balloon grow in real time.
- **Goal cap.** Once `overallTally >= goal` the balloon is "popped" — further check-ins are refused with an "Already met goal" toast until an admin resets or raises the goal.
- **Particle feedback.** Each successful check-in triggers a `balloon_float` particle at the dropped asset's position.
- **Admin controls.** Visitors with `visitor.isAdmin` see a cog icon in the drawer that toggles into the admin view: set a new goal (1–999) or reset all check-in data.
- **Confirmation modal on reset.** Reset is guarded by a "Reset? All player data will be erased." modal before it fires.

## Required Assets with Unique Names

Only the key asset needs to be placed — the app never drops assets, generates label assets, or looks anything up by `uniqueName`.

## Technical Architecture

### Data Objects

The entire app state lives on the **dropped asset** the visitor clicked. No visitor / world / user data object is written except analytics markers.

#### DroppedAsset (`droppedAsset.dataObject`)

Initialised by `initializeDroppedAssetDataObject` under a per-minute `lockId` if `goal` is unset.

```ts
{
  dailyCheckIns: {
    [dateKey: `YYYY-MM-DD`]: {
      total: number;                       // clicks on that day
      users: {
        [profileId: string]: string;       // ISO timestamp of that profile's check-in
      };
    };
  };
  goal: number;                            // default 100
  overallTally: number;                    // total check-ins this session
  imageSrc: string;                        // https://sdk-grow.s3.us-east-1.amazonaws.com/Pump-{stage}.png
  lock?: { lockId: string };               // written by initializer, released immediately
}
```

Notes:

- `getToday()` returns a **local-time** `YYYY-MM-DD` key (from `new Date().getFullYear/getMonth/getDate`), so day boundaries are the server's local timezone.
- `handleReset` wipes `dailyCheckIns`, sets `overallTally = 0`, `goal = 100`, and rewrites `imageSrc` back to `Pump-0.png`. It also calls `updateWebImageLayers` so the on-world image reverts immediately.
- `handleUpdateGoal` writes the new `goal` and calls `updateWebImageLayers` with the recomputed stage (raising the goal can visually shrink the balloon; lowering it can advance the balloon).

#### Visitor / World / User

- **Visitor** — only touched to `fireToast` for feedback and to `updateDataObject({})` on `/game-state` for the `starts` analytic; no persistent visitor state.
- **World** — only touched to `triggerParticle("balloon_float", …)` on a successful check-in.
- **User** — never touched.

### Growth mechanic (at a glance)

- **Action-based**, not time-based: the balloon only advances on a `/check-in` call.
- **Shared, not per-visitor**: everyone in the world is pumping the same balloon on the same dropped asset.
- **Rate-limited to once per profile per day** via `dailyCheckIns[today].users[profileId]` presence.
- **No stages/levels beyond visual**: the app has no per-user levels, XP, tiers, streaks, badges, or unlockables. The only "progression" surface is the shared 0–19 stage image.
- **No themes / variants**: images are always `Pump-{stage}.png` from `sdk-grow.s3.us-east-1.amazonaws.com` (S3 URL is hardcoded in `getImageSrc.ts` — the `S3_BUCKET` env var is echoed in `/system/health` but not otherwise read).

## API Endpoints

All routes mount under `/api`. Every request goes through `getCredentials`, which requires `interactiveNonce`, `interactivePublicKey`, `urlSlug`, `visitorId` and enforces `INTERACTIVE_KEY === query.interactivePublicKey`. The response middleware in `server/index.ts` strips `topia`, `credentials`, `jwt`, and `requestOptions` from every payload via `cleanReturnPayload`.

| Method | Route            | Purpose                                                                                                                                                                                                                                                                                                                          |
| ------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/`              | Smoke test — returns `{ message: "Hello from server!" }`.                                                                                                                                                                                                                                                                        |
| `GET`  | `/system/health` | App version, server start date, and non-secret env flags (`NODE_ENV`, `INSTANCE_DOMAIN`, `INTERACTIVE_KEY`, `S3_BUCKET`).                                                                                                                                                                                                        |
| `GET`  | `/game-state`    | Drawer bootstrap. Initialises the dropped-asset data object if missing, returns `{ dailyCheckIns, goal, overallTally, imageSrc }` and `{ visitor: { isAdmin } }`. Fires the `starts` analytic.                                                                                                                                   |
| `GET`  | `/check-in`      | Records the visitor's daily check-in. Rejects (via toast, but still returns `200`) if the profile has already checked in today or if `overallTally >= goal`. Otherwise increments the daily total, bumps `overallTally`, recomputes the stage, rewrites `imageSrc` on the dropped asset, and fires the `balloon_float` particle. |
| `PUT`  | `/goal`          | Admin action. Body `{ goal: number }`. Writes `goal`, recomputes stage from current tally, and rewrites the balloon image.                                                                                                                                                                                                       |
| `PUT`  | `/reset`         | Admin action. Clears `dailyCheckIns`, sets `overallTally: 0`, `goal: 100`, and resets `imageSrc` to `Pump-0.png`.                                                                                                                                                                                                                |

There is no server-side `isAdmin` check on `/goal` or `/reset` — the admin gate is a client-side toggle keyed on `visitor.isAdmin`. Anyone with valid interactive credentials for the world could call the endpoints directly.

## Analytics

Analytics are attached to SDK data-object writes via the `analytics` option. Sheet logging is **not** wired up in this app — `server/utils/addNewRowToGoogleSheets.ts` exists but is not imported anywhere and no `GOOGLESHEETS_*` env vars are read at runtime.

| Event                | Fired when                                                                                         | Where                                                               | Uniqueness             |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- |
| `starts`             | Drawer opens (every `/game-state` load).                                                           | `handleGetGameState` → `visitor.updateDataObject({}, …)`            | `uniqueKey: profileId` |
| `completions`        | A visitor successfully checks in for the day.                                                      | `handleCheckIn` → `droppedAsset.updateDataObject(…, { analytics })` | `uniqueKey: profileId` |
| `goal_reached`       | A check-in pushes `overallTally` to equal `goal`. Fires alongside `completions` on the same write. | `handleCheckIn`                                                     | none (world-scoped)    |
| `new_configurations` | Admin submits a new goal via `/goal`.                                                              | `handleUpdateGoal`                                                  | `uniqueKey: profileId` |

No analytic is fired on `/reset`.

## Environment Variables

Create a `.env` at the app root. See `.env-example` for the template (note that the boilerplate example includes AWS variables that this app does not actually use — see below).

| Variable             | Description                                                                                                                                                                                 | Required         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `INTERACTIVE_KEY`    | Topia interactive app key. Also verified against `interactivePublicKey` on every request.                                                                                                   | Yes              |
| `INTERACTIVE_SECRET` | Topia interactive app secret.                                                                                                                                                               | Yes              |
| `INSTANCE_DOMAIN`    | Topia API domain (`api.topia.io` for production, `api-stage.topia.io` for staging). Defaults to `api.topia.io`.                                                                             | No (recommended) |
| `INSTANCE_PROTOCOL`  | `https` for prod/staging, `http` for local dev. Defaults to `https`.                                                                                                                        | No               |
| `PORT`               | Server port. Defaults to `3000`.                                                                                                                                                            | No               |
| `NODE_ENV`           | When `"development"`, adds a permissive CORS origin list. Any other value causes the server to statically serve `client/build`.                                                             | No               |
| `API_KEY`            | Passed to `new Topia({ apiKey })` for parity with other apps; not required by any route in Grow.                                                                                            | No               |
| `S3_BUCKET`          | Only echoed in the `/system/health` response. **Not** used to build image URLs — the balloon S3 URL is hardcoded to `sdk-grow.s3.us-east-1.amazonaws.com` in `server/utils/getImageSrc.ts`. | No               |

Variables listed in `.env-example` but **not read anywhere in the code**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `SKIP_PREFLIGHT_CHECK`. They can be safely omitted. Similarly `GOOGLESHEETS_CLIENT_EMAIL`, `GOOGLESHEETS_PRIVATE_KEY`, `GOOGLESHEETS_SHEET_ID`, `GOOGLESHEETS_SHEET_RANGE` are referenced only inside the dead `addNewRowToGoogleSheets.ts` module and have no effect on the running app.

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)
- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

Requires Node 20+.

```bash
# from the app root
npm install                    # installs root + client + server workspaces

# create .env at the app root (see Environment Variables above)
cp .env-example .env           # then fill in INTERACTIVE_KEY / INTERACTIVE_SECRET

# run server + client concurrently
npm run dev
```

- Server: `http://localhost:3000` (Express)
- Client (Vite dev): `http://localhost:5173`

The Vite dev server proxies `/api` to the Express server; in production the Express server itself statically serves `client/build/`.

### Production mode

```bash
npm install
npm run build    # builds client + server workspaces
npm start        # runs the compiled server, which serves client/build
```

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### App-specific notes

- **Interactive-key auth on every request.** `getCredentials` short-circuits with an error if `INTERACTIVE_KEY !== query.interactivePublicKey`. There is no JWT check beyond that — the SDK's own request signing handles authenticity.
- **All state lives on one dropped asset.** The drawer's target dropped asset (from `credentials.assetId`) is both the state store and the visual: writes to `dataObject` persist the tally/goal/daily check-ins, and `updateWebImageLayers` mutates the in-world image so the balloon grows for everyone. There is no world data object write and no visitor data object write beyond analytics markers.
- **`getToday()` uses local time**, not UTC. Day rollover happens at midnight in the server's local timezone. If the server is deployed to a different TZ than the audience, the "one check-in per day" window may not line up with the users' calendar day.
- **No server-side admin enforcement.** Admin actions (`PUT /goal`, `PUT /reset`) are gated only by the client-side `visitor.isAdmin` UI toggle. Any authenticated visitor can call them directly. Treat these endpoints accordingly.
- **`addNewRowToGoogleSheets.ts` is dead code.** It's compiled but never imported. If you want Sheets logging in this app you would need to wire it into a controller and set the `GOOGLESHEETS_*` env vars.
- **`AWS_*` env variables are cargo-culted from the boilerplate.** Nothing in `server/` references `@aws-sdk`, `aws-sdk`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or `AWS_SESSION_TOKEN`. Balloon images are fetched by the client (and referenced by `updateWebImageLayers`) as public S3 URLs.
- **S3 URL is hardcoded.** `getImageSrc(stage)` returns `` `https://sdk-grow.s3.us-east-1.amazonaws.com/Pump-${stage}.png` ``. Changing bucket names via `S3_BUCKET` will not take effect — edit `getImageSrc.ts` if you need a different bucket.
- **`AdminIconButton` toggle bug worth noting.** `PageContainer` wraps the button's `onClick` in its own toggler, and `AdminIconButton` internally calls `setShowSettings(showSettings)` (the current value, not the negation). The wrapping toggle in `PageContainer` is what actually flips state — the inner call passes through the outer wrapper.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/grow-dev), [Prod](https://topia.io/grow-prod)
- [Notion One Pager](https://app.notion.com/p/topiaio/Grow-1d040e35bdb9805cbed2cb5b678ce5bf?v=71f6c3828d3b4f33960326f9bde24781)
