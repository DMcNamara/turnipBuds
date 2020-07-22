# Turnip Buds

![build](https://github.com/DMcNamara/turnipBuds/workflows/Test/badge.svg)
[![redux channel on discord](https://img.shields.io/badge/discord-TurnipBuds-61DAFB.svg?style=flat-square)](https://discord.gg/3WTnPhs)


Repo for Turnip Buds, a companion app for Animal Crossing: New Horizons, available on [iOS](https://apps.apple.com/us/app/turnip-buds/id1512791562?ls=1) and [Android](https://play.google.com/store/apps/details?id=com.dmcnamara.turnipbuds&hl=en_US).
Created using React Native, Firebase Firestore, Expo, and TypeScript 


## Getting Setup
- `yarn install && cd functions && npm install`
- copy app.config.example to app.config.ts, set up Firebase project and fill in env vars
- `npx firebase login`
- run `yarn export` or copy over old fsData to seed simulator
- `yarn dev` to start simulators