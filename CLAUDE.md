# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Turnip Buds — a React Native (Expo SDK 37) companion app for Animal Crossing: New Horizons that tracks and predicts turnip (stalk market) prices, and lets users share prices with friends. Frontend is TypeScript + Redux + Firebase (Firestore/Auth/Functions), backend is Firebase Cloud Functions (also TypeScript). Uses the `stalk-market` npm package for the actual price-pattern prediction algorithm.

## Setup

- `yarn install && cd functions && npm install`
- Copy `app.config.example` to `app.config.ts`, set up a Firebase project, and fill in the env vars (Firebase config, AdMob IDs, Google Sign-In IDs, Sentry DSN).
- `npx firebase login`
- Run `yarn export` to seed the emulator, or copy over an existing `fsData` export.

## Common commands

Run from repo root unless noted:

- `yarn dev` — starts everything needed for local development concurrently: functions TS watcher, Firebase emulators (Firestore/Functions/RTDB, seeded from `fsData`), and the Expo dev server.
- `yarn start` / `yarn ios` / `yarn android` / `yarn web` — Expo dev server only, without functions/emulators.
- `yarn test` — runs the Jest test suite (jest-expo preset, ts-jest for `.ts(x)`). Test files match `(/__tests__/.*|(\.|/)(test|spec))\.(jsx?|tsx?)$` (e.g. `src/store/friends/friends.repo.spec.ts`).
  - Run a single test file: `yarn test src/store/friends/friends.repo.spec.ts`
- `yarn simulate` — starts Firebase emulators only, importing `fsData`.
- `yarn export` — exports current emulator Firestore state to `fsData` for reuse as seed data.
- `npx eslint . --ext .ts,.tsx` — lint the app code (no lint script is defined in `package.json`; ESLint config is in `.eslintrc.js`).

Inside `functions/`:
- `npm run watch` — `tsc --watch`, compiles `functions/src` to `functions/lib`.
- `npm run build` — one-off `tsc` build.
- `npm run lint` — `tslint` (runs automatically as a Firebase predeploy hook, along with build).
- `npm run shell` — build then `firebase functions:shell` for interactively invoking functions.
- `npm run deploy` — `firebase deploy --only functions`.
- `npm run logs` — `firebase functions:log`.

CI (`.github/workflows/`) runs `yarn test` on push/PR to `main`.

## Architecture

### Frontend structure (`src/`)

Feature-folder layout, not layered by type. Each feature area (`home`, `friends`, `login`, `settings`) has its own directory with a `*Container.tsx` (connects to Redux/Firestore) and presentational components. `common/` holds cross-feature UI (predictions charts, week input, toast, ads) and utilities.

- **State**: Redux (`src/store/index.ts`) combines `firestore` (via `redux-firestore`/`react-redux-firebase`), `auth`, `friendIndex`, and `toast` reducers, persisted with `redux-persist` (AsyncStorage). Read data with `useTypedSelector` (typed against `RootState`), not plain `useSelector`.
- **Firestore access pattern**: `react-redux-firebase`'s `useFirestoreConnect` (see `App.tsx`, `Tabs`) subscribes screens to collections/docs, which then land in the `firestore` slice of the store — there's no separate data-fetching layer for reads.
- **Collections/models**: `src/store/collections.ts` is the single source of truth for Firestore document shapes (`User`, `Friend`, `WeekPrice`, `PriceAnalysis`) and collection name constants (`UsersCollection`, `WeeksCollection`, `FriendsCollection`, etc.). `WeekPrice` is a class (not a plain interface) because Firestore can't store nested arrays — `predictions[].matches` round-trips as a JSON string and `WeekPrice`'s constructor parses it back into an array.
- **Repositories**: `src/store/**/*.repository.ts` and `*.repo.ts` hold pure functions operating on domain data (e.g. `weeks/week-price.repository.ts` derives min/max price ranges and the turnipprophet.io share link from a `WeekPrice`; `friends/friends.repo.ts` implements friend list sorting). These are the primary unit-test targets (see `friends.repo.spec.ts`).
- **Cloud Function calls from the client**: exposed via `Functions` in `src/store/index.ts` (e.g. `Functions.addFriend`), wrapping `firebase.functions().httpsCallable(...)`.
- **Emulator wiring**: `src/store/index.ts` switches Firestore/RTDB/Functions to local emulator hosts whenever `__DEV__` is true — there's no separate config flag, so behavior differs between a dev client and a release build based on that alone.
- **Runtime config/secrets**: not env vars in the Node sense — they come from `app.config.ts`'s `extra` block via `expo-constants` (`Constants.manifest.extra`), consumed e.g. in `src/store/index.ts`.

### Cloud Functions (`functions/src/`)

Small, two-file backend:
- `index.ts`: the `addFriend` callable (validates auth + input, finds the target user by email, writes a `friends` doc) and the `onUserAdded` Firestore trigger (backfills `friend` uid on any pending friend records once a user with that email signs up — handles the "add a friend before they've made an account" case).
- `predictions.ts`: `setPredictions`, a Firestore `onUpdate` trigger on `users/{userId}/weeks/{weekId}` that re-runs `stalk-market`'s `analyzePrices` whenever price fields actually change, writes back `predictions`/`pattern` on the week doc, and mirrors the current likeliest pattern + most-recent price onto the parent `users/{userId}` doc (denormalized so friends' lists can display a pattern without reading each friend's `weeks` subcollection).
- Both frontend (`src/store/collections.ts`) and functions (`predictions.ts`) independently build the same 14-element price array (buy price + 12 AM/PM slots) from a week doc — keep them in sync if the week shape changes.

### Firestore data model & security (`firebase/firestore.rules`)

- `users/{userId}` — profile + denormalized latest price info; readable by any authenticated user, writable only by the owner.
- `users/{userId}/weeks/{weekId}` — per-week price entries; same read/write rules, nested under the owning user.
- `friends/{friendId}` — a friend-relationship doc (`{ accepted, email, friend: uid, uid }`); readable by any authenticated user, writable only by the doc's `uid` owner. `friend` is populated either immediately (if the target already has an account) or later by `onUserAdded`.

### Code style

- Tabs for indentation (2-space only for `package.json`/`firestore.rules`, per `.editorconfig`); Prettier config: single quotes, semicolons, trailing commas (es5), no bracket-same-line.
- ESLint extends `airbnb`-adjacent + `plugin:react-native/all` + `prettier`; `react-native/no-raw-text` is disabled.
